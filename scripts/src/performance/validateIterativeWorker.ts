/**
 * Worker process for a single iterative validation run.
 *
 * Reads TSV data one record at a time, parsing and submitting each record to the
 * iterative validator immediately without buffering the full dataset in memory.
 *
 * Invoked by validateIterative.ts with two arguments: the case number (1, 2, or 3)
 * and the record count. Prints one JSON line to stdout containing a WorkerResult,
 * then exits. If the process is killed by OOM before printing, the orchestrator
 * detects exit code 134 and records OOM.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Schema, UnprocessedDataRecord } from '@overture-stack/lectern-dictionary';
import { DictionaryValidator, SchemaValidator, parseRecordValues } from '@overture-stack/lectern-validation';
import { dictionaryMultiRelationship } from '../sampleDictionaries/dictionaryMultiRelationship';
import { dictionarySimple } from '../sampleDictionaries/dictionarySimple';
import { dictionaryWideUniqueKey } from '../sampleDictionaries/dictionaryWideUniqueKey';
import { CASE3_SCHEMA_MULTIPLIERS, DATA_DIR } from './reproduceValidationMemoryConstants';

export type IterativeWorkerResultOk = {
	status: 'OK';
	caseLabel: string;
	caseName: string;
	inputCount: number;
	recordCount: number;
	peakHeapMB: number;
	elapsedMs: number;
	msPerRecord: number;
	errorCount: number;
};

export type IterativeWorkerResultFailed = {
	status: 'OOM' | 'SUBMIT_ERROR';
	caseLabel: string;
	caseName: string;
	inputCount: number;
	recordCount: number;
};

export type IterativeWorkerResult = IterativeWorkerResultOk | IterativeWorkerResultFailed;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeapMemoryMB(): number {
	return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10;
}

function* streamTsvLines(filePath: string): Generator<UnprocessedDataRecord> {
	const fd = fs.openSync(filePath, 'r');
	const buffer = new Uint8Array(65536);
	let remainder = '';
	let headers: string[] | undefined;

	try {
		let bytesRead: number;
		do {
			bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
			const chunk = remainder + Buffer.from(buffer.subarray(0, bytesRead)).toString('utf8');
			const parts = chunk.split('\n');
			remainder = parts.pop() ?? '';

			for (const part of parts) {
				if (headers === undefined) {
					headers = part.split('\t');
					continue;
				}
				const values = part.split('\t');
				const record: UnprocessedDataRecord = {};
				headers.forEach((header, index) => {
					record[header] = values[index] ?? '';
				});
				yield record;
			}
		} while (bytesRead > 0);

		if (remainder.length > 0 && headers !== undefined) {
			const values = remainder.split('\t');
			const record: UnprocessedDataRecord = {};
			headers.forEach((header, index) => {
				record[header] = values[index] ?? '';
			});
			yield record;
		}
	} finally {
		fs.closeSync(fd);
	}
}

// ─── Case runners ─────────────────────────────────────────────────────────────

function runSingleSchemaCase(
	caseLabel: string,
	caseName: string,
	inputCount: number,
	schema: Schema,
	filePath: string,
): IterativeWorkerResult {
	const validator = new SchemaValidator(schema);

	process.stderr.write('validate_start\n');
	const startTime = Date.now();

	let submittedCount = 0;
	let recordErrorCount = 0;
	let peakHeapMB = getHeapMemoryMB();

	for (const rawRecord of streamTsvLines(filePath)) {
		const parseResult = parseRecordValues(rawRecord, schema);
		const submitResult = validator.submit({ id: String(submittedCount), data: parseResult.data.record });
		if (submitResult.success) {
			for (const recordResult of submitResult.data) {
				if (!recordResult.valid) {
					recordErrorCount++;
				}
			}
		}
		submittedCount++;

		// Sample heap every 10,000 records. The streaming loop is synchronous so setInterval
		// cannot be used — we poll inline at low frequency to keep overhead negligible.
		if (submittedCount % 10000 === 0) {
			const heapMB = getHeapMemoryMB();
			if (heapMB > peakHeapMB) {
				peakHeapMB = heapMB;
			}
		}
	}

	const heapAtEnd = getHeapMemoryMB();
	if (heapAtEnd > peakHeapMB) {
		peakHeapMB = heapAtEnd;
	}

	let crossRecordErrorCount = 0;
	for (const _ of validator.errors()) {
		crossRecordErrorCount++;
	}

	const elapsedMs = Date.now() - startTime;
	return {
		status: 'OK',
		caseLabel,
		caseName,
		inputCount,
		recordCount: submittedCount,
		peakHeapMB,
		elapsedMs,
		msPerRecord: elapsedMs / submittedCount,
		errorCount: recordErrorCount + crossRecordErrorCount,
	};
}

function runCase1(recordCount: number, withErrors: boolean): IterativeWorkerResult {
	const schema = dictionarySimple.schemas[0];
	const dataDir = withErrors ? 'case1-errors' : 'case1';
	const filePath = path.join(DATA_DIR, dataDir, String(recordCount), `${schema.name}.tsv`);
	return runSingleSchemaCase('1', 'simple', recordCount, schema, filePath);
}

function runCase2(recordCount: number, withErrors: boolean): IterativeWorkerResult {
	const schema = dictionaryWideUniqueKey.schemas[0];
	const dataDir = withErrors ? 'case2-errors' : 'case2';
	const filePath = path.join(DATA_DIR, dataDir, String(recordCount), `${schema.name}.tsv`);
	return runSingleSchemaCase('2', 'wide-unique-key', recordCount, schema, filePath);
}

function runCase3(recordCount: number, withErrors: boolean): IterativeWorkerResult {
	const schemaNames = Object.keys(CASE3_SCHEMA_MULTIPLIERS);
	const dataDir = withErrors ? 'case3-errors' : 'case3';
	const case3Dir = path.join(DATA_DIR, dataDir, String(recordCount));
	const validator = new DictionaryValidator(dictionaryMultiRelationship);

	process.stderr.write('validate_start\n');
	const startTime = Date.now();

	let totalSubmitted = 0;
	let recordErrorCount = 0;
	let peakHeapMB = getHeapMemoryMB();

	for (const schemaName of schemaNames) {
		const schema = dictionaryMultiRelationship.schemas.find((schema) => schema.name === schemaName);
		if (schema === undefined) {
			return {
				status: 'SUBMIT_ERROR',
				caseLabel: '3',
				caseName: 'multi-relationship',
				inputCount: recordCount,
				recordCount,
			};
		}
		const filePath = path.join(case3Dir, `${schemaName}.tsv`);
		let schemaRowIndex = 0;
		for (const rawRecord of streamTsvLines(filePath)) {
			const parseResult = parseRecordValues(rawRecord, schema);
			const submitResult = validator.submit(schemaName, {
				id: String(schemaRowIndex),
				data: parseResult.data.record,
			});
			if (submitResult.success) {
				for (const recordResult of submitResult.data) {
					if (!recordResult.valid) {
						recordErrorCount++;
					}
				}
			}
			schemaRowIndex++;
			totalSubmitted++;

			if (totalSubmitted % 10000 === 0) {
				const heapMB = getHeapMemoryMB();
				if (heapMB > peakHeapMB) {
					peakHeapMB = heapMB;
				}
			}
		}
	}

	const heapAtEnd = getHeapMemoryMB();
	if (heapAtEnd > peakHeapMB) {
		peakHeapMB = heapAtEnd;
	}

	let crossSchemaErrorCount = 0;
	for (const _ of validator.errors()) {
		crossSchemaErrorCount++;
	}

	const elapsedMs = Date.now() - startTime;
	return {
		status: 'OK',
		caseLabel: '3',
		caseName: 'multi-relationship',
		inputCount: recordCount,
		recordCount: totalSubmitted,
		peakHeapMB,
		elapsedMs,
		msPerRecord: elapsedMs / totalSubmitted,
		errorCount: recordErrorCount + crossSchemaErrorCount,
	};
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const [, , caseArg, countArg, variantArg] = process.argv;
const caseNumber = Number(caseArg);
const recordCount = Number(countArg);
const withErrors = variantArg === 'errors';

if (![1, 2, 3].includes(caseNumber) || isNaN(recordCount)) {
	console.error(`Usage: worker <case> <recordCount> [errors]  (case must be 1, 2, or 3)`);
	process.exit(1);
}

process.stderr.write(`startup heap=${getHeapMemoryMB()}MB\n`);

const runners: Record<number, (count: number, withErrors: boolean) => IterativeWorkerResult> = {
	1: runCase1,
	2: runCase2,
	3: runCase3,
};

const result = runners[caseNumber](recordCount, withErrors);
process.stdout.write(JSON.stringify(result) + '\n');

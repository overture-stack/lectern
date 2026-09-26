/**
 * Worker process for a single validation run. Invoked by reproduceValidationMemory.ts with
 * two arguments: the case number (1, 2, or 3) and the record count.
 *
 * Prints one JSON line to stdout containing a WorkerResult, then exits. If the process is
 * killed by OOM before printing, the orchestrator detects exit code 134 and records OOM.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { DataRecord, Schema, UnprocessedDataRecord } from '@overture-stack/lectern-dictionary';
import { parseRecordValues, validateDictionary, validateSchema } from '@overture-stack/lectern-validation';
import { dictionaryMultiRelationship } from '../sampleDictionaries/dictionaryMultiRelationship';
import { dictionarySimple } from '../sampleDictionaries/dictionarySimple';
import { dictionaryWideUniqueKey } from '../sampleDictionaries/dictionaryWideUniqueKey';
import { CASE3_SCHEMA_MULTIPLIERS, DATA_DIR } from './reproduceValidationMemoryConstants';

export type WorkerResultOk = {
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

export type WorkerResultFailed = {
	status: 'OOM' | 'PARSE_ERROR';
	caseLabel: string;
	caseName: string;
	inputCount: number;
	recordCount: number;
};

export type WorkerResult = WorkerResultOk | WorkerResultFailed;

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

type ParseSchemaStreamResult = { success: true; records: DataRecord[] } | { success: false };

function readAndParseSchema(filePath: string, schema: Schema): ParseSchemaStreamResult {
	const records: DataRecord[] = [];
	let hasParseError = false;

	for (const rawRecord of streamTsvLines(filePath)) {
		const result = parseRecordValues(rawRecord, schema);
		records.push(result.data.record);
		if (!result.success) {
			hasParseError = true;
		}
	}

	return hasParseError ? { success: false } : { success: true, records };
}

// ─── Case runners ─────────────────────────────────────────────────────────────

function runCase1(recordCount: number, withErrors: boolean): WorkerResult {
	const schema = dictionarySimple.schemas[0];
	const dataDir = withErrors ? 'case1-errors' : 'case1';
	const filePath = path.join(DATA_DIR, dataDir, String(recordCount), `${schema.name}.tsv`);

	const parseResult = readAndParseSchema(filePath, schema);
	const heapAfterParse = getHeapMemoryMB();

	if (!parseResult.success) {
		return { status: 'PARSE_ERROR', caseLabel: '1', caseName: 'simple', inputCount: recordCount, recordCount };
	}

	process.stderr.write('validate_start\n');
	const startTime = Date.now();
	const validationResult = validateSchema(parseResult.records, schema);
	const elapsedMs = Date.now() - startTime;
	const heapAfterValidation = getHeapMemoryMB();

	const validationErrors = validationResult.valid ? [] : validationResult.details;
	const errorCount = validationErrors.reduce((sum, error) => sum + error.recordErrors.length, 0);

	return {
		status: 'OK',
		caseLabel: '1',
		caseName: 'simple',
		inputCount: recordCount,
		recordCount,
		peakHeapMB: Math.max(heapAfterParse, heapAfterValidation),
		elapsedMs,
		msPerRecord: elapsedMs / recordCount,
		errorCount,
	};
}

function runCase2(recordCount: number, withErrors: boolean): WorkerResult {
	const schema = dictionaryWideUniqueKey.schemas[0];
	const dataDir = withErrors ? 'case2-errors' : 'case2';
	const filePath = path.join(DATA_DIR, dataDir, String(recordCount), `${schema.name}.tsv`);

	const parseResult = readAndParseSchema(filePath, schema);
	const heapAfterParse = getHeapMemoryMB();

	if (!parseResult.success) {
		return { status: 'PARSE_ERROR', caseLabel: '2', caseName: 'wide-unique-key', inputCount: recordCount, recordCount };
	}

	process.stderr.write('validate_start\n');
	const startTime = Date.now();
	const validationResult = validateSchema(parseResult.records, schema);
	const elapsedMs = Date.now() - startTime;
	const heapAfterValidation = getHeapMemoryMB();

	const validationErrors = validationResult.valid ? [] : validationResult.details;
	const errorCount = validationErrors.reduce((sum, error) => sum + error.recordErrors.length, 0);

	return {
		status: 'OK',
		caseLabel: '2',
		caseName: 'wide-unique-key',
		inputCount: recordCount,
		recordCount,
		peakHeapMB: Math.max(heapAfterParse, heapAfterValidation),
		elapsedMs,
		msPerRecord: elapsedMs / recordCount,
		errorCount,
	};
}

function runCase3(recordCount: number, withErrors: boolean): WorkerResult {
	const schemaNames = Object.keys(CASE3_SCHEMA_MULTIPLIERS);
	const dataDir = withErrors ? 'case3-errors' : 'case3';
	const case3Dir = path.join(DATA_DIR, dataDir, String(recordCount));

	const typedData: Record<string, DataRecord[]> = {};
	for (const schemaName of schemaNames) {
		const schema = dictionaryMultiRelationship.schemas.find((s) => s.name === schemaName);
		if (schema === undefined) {
			return {
				status: 'PARSE_ERROR',
				caseLabel: '3',
				caseName: 'multi-relationship',
				inputCount: recordCount,
				recordCount,
			};
		}
		const filePath = path.join(case3Dir, `${schemaName}.tsv`);
		const parseResult = readAndParseSchema(filePath, schema);
		if (!parseResult.success) {
			return {
				status: 'PARSE_ERROR',
				caseLabel: '3',
				caseName: 'multi-relationship',
				inputCount: recordCount,
				recordCount,
			};
		}
		typedData[schemaName] = parseResult.records;
	}

	const heapAfterParse = getHeapMemoryMB();

	const totalRecords = Object.values(typedData).reduce((sum, records) => sum + records.length, 0);
	process.stderr.write('validate_start\n');
	const startTime = Date.now();
	const validationResult = validateDictionary(typedData, dictionaryMultiRelationship);
	const elapsedMs = Date.now() - startTime;
	const heapAfterValidation = getHeapMemoryMB();

	const validationErrors = validationResult.valid ? [] : validationResult.details;
	const errorCount = validationErrors.reduce((sum, error) => {
		if (error.reason === 'INVALID_RECORDS') {
			return sum + error.invalidRecords.reduce((recordSum, record) => recordSum + record.recordErrors.length, 0);
		}
		return sum + 1;
	}, 0);

	return {
		status: 'OK',
		caseLabel: '3',
		caseName: 'multi-relationship',
		inputCount: recordCount,
		recordCount: totalRecords,
		peakHeapMB: Math.max(heapAfterParse, heapAfterValidation),
		elapsedMs,
		msPerRecord: elapsedMs / totalRecords,
		errorCount,
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

const runners: Record<number, (count: number, withErrors: boolean) => WorkerResult> = {
	1: runCase1,
	2: runCase2,
	3: runCase3,
};

const result = runners[caseNumber](recordCount, withErrors);
process.stdout.write(JSON.stringify(result) + '\n');

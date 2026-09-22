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
import { CASE3_COUNTS, DATA_DIR, MAX_RECORD_COUNT } from './reproduceValidationMemoryConstants';

export type WorkerResultOk = {
	status: 'OK';
	caseLabel: string;
	caseName: string;
	recordCount: number;
	heapAfterParseMB: number;
	heapAfterValidationMB: number;
	elapsedMs: number;
	msPerRecord: number;
	errorCount: number;
};

export type WorkerResultFailed = {
	status: 'OOM' | 'PARSE_ERROR';
	caseLabel: string;
	caseName: string;
	recordCount: number;
};

export type WorkerResult = WorkerResultOk | WorkerResultFailed;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeapMemoryMB(): number {
	return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10;
}

function* streamTsvLines(filePath: string, lineLimit?: number): Generator<UnprocessedDataRecord> {
	const fd = fs.openSync(filePath, 'r');
	const buffer = new Uint8Array(65536);
	let remainder = '';
	let headers: string[] | undefined;
	let linesYielded = 0;
	const limit = lineLimit ?? Infinity;

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
				if (linesYielded >= limit) {
					return;
				}
				const values = part.split('\t');
				const record: UnprocessedDataRecord = {};
				headers.forEach((header, index) => {
					record[header] = values[index] ?? '';
				});
				yield record;
				linesYielded++;
			}
		} while (bytesRead > 0 && linesYielded < limit);

		if (remainder.length > 0 && linesYielded < limit && headers !== undefined) {
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

function readAndParseSchema(filePath: string, schema: Schema, lineLimit?: number): ParseSchemaStreamResult {
	const records: DataRecord[] = [];
	let hasParseError = false;

	for (const rawRecord of streamTsvLines(filePath, lineLimit)) {
		const result = parseRecordValues(rawRecord, schema);
		records.push(result.data.record);
		if (!result.success) {
			hasParseError = true;
		}
	}

	return hasParseError ? { success: false } : { success: true, records };
}

// ─── Case runners ─────────────────────────────────────────────────────────────

function runCase1(recordCount: number): WorkerResult {
	const schema = dictionarySimple.schemas[0];
	const filePath = path.join(DATA_DIR, 'case1', `${schema.name}.tsv`);

	const parseResult = readAndParseSchema(filePath, schema, recordCount);
	const heapAfterParse = getHeapMemoryMB();

	if (!parseResult.success) {
		return { status: 'PARSE_ERROR', caseLabel: '1', caseName: 'simple', recordCount };
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
		recordCount,
		heapAfterParseMB: heapAfterParse,
		heapAfterValidationMB: heapAfterValidation,
		elapsedMs,
		msPerRecord: elapsedMs / recordCount,
		errorCount,
	};
}

function runCase2(recordCount: number): WorkerResult {
	const schema = dictionaryWideUniqueKey.schemas[0];
	const filePath = path.join(DATA_DIR, 'case2', `${schema.name}.tsv`);

	const parseResult = readAndParseSchema(filePath, schema, recordCount);
	const heapAfterParse = getHeapMemoryMB();

	if (!parseResult.success) {
		return { status: 'PARSE_ERROR', caseLabel: '2', caseName: 'wide-unique-key', recordCount };
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
		recordCount,
		heapAfterParseMB: heapAfterParse,
		heapAfterValidationMB: heapAfterValidation,
		elapsedMs,
		msPerRecord: elapsedMs / recordCount,
		errorCount,
	};
}

function runCase3(recordCount: number): WorkerResult {
	const schemaNames = Object.keys(CASE3_COUNTS) as (keyof typeof CASE3_COUNTS)[];
	const case3Dir = path.join(DATA_DIR, 'case3');

	const scaleFactor = recordCount / MAX_RECORD_COUNT;
	const scaledCounts = Object.fromEntries(
		schemaNames.map((schemaName) => [schemaName, Math.round(CASE3_COUNTS[schemaName] * scaleFactor)]),
	);

	const typedData: Record<string, DataRecord[]> = {};
	for (const schemaName of schemaNames) {
		const schema = dictionaryMultiRelationship.schemas.find((s) => s.name === schemaName);
		if (schema === undefined) {
			return { status: 'PARSE_ERROR', caseLabel: '3', caseName: 'multi-relationship', recordCount };
		}
		const filePath = path.join(case3Dir, `${schemaName}.tsv`);
		const parseResult = readAndParseSchema(filePath, schema, scaledCounts[schemaName]);
		if (!parseResult.success) {
			return { status: 'PARSE_ERROR', caseLabel: '3', caseName: 'multi-relationship', recordCount };
		}
		typedData[schemaName] = parseResult.records;
	}

	const heapAfterParse = getHeapMemoryMB();

	const totalRecords = Object.values(scaledCounts).reduce((sum, count) => sum + count, 0);
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
		recordCount: totalRecords,
		heapAfterParseMB: heapAfterParse,
		heapAfterValidationMB: heapAfterValidation,
		elapsedMs,
		msPerRecord: elapsedMs / totalRecords,
		errorCount,
	};
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const [, , caseArg, countArg] = process.argv;
const caseNumber = Number(caseArg);
const recordCount = Number(countArg);

if (![1, 2, 3].includes(caseNumber) || isNaN(recordCount)) {
	console.error(`Usage: worker <case> <recordCount>  (case must be 1, 2, or 3)`);
	process.exit(1);
}

process.stderr.write(`startup heap=${getHeapMemoryMB()}MB\n`);

const runners: Record<number, (count: number) => WorkerResult> = {
	1: runCase1,
	2: runCase2,
	3: runCase3,
};

const result = runners[caseNumber](recordCount);
process.stdout.write(JSON.stringify(result) + '\n');

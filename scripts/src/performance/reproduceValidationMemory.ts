/**
 * Orchestrator entry point for the validation memory reproduction.
 *
 * Phase 1: Ensures test data TSV files exist in reproduceValidationMemory-data/, generating
 *          them if absent or stale.
 *
 * Phase 2: For each case and record count, spawns a child process running
 *          reproduceValidationMemoryWorker.ts with the case number and count as arguments.
 *          Each worker runs a single validation and prints one JSON result line. The
 *          orchestrator collects the line and prints the formatted table row. If the child
 *          exits with code 134 (OOM kill) the orchestrator records OOM and stops that case.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import type { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { generateDictionaryFiles, generateSchemaFile } from '@overture-stack/lectern-data-generator';
import { dictionaryMultiRelationship } from '../sampleDictionaries/dictionaryMultiRelationship';
import { dictionarySimple } from '../sampleDictionaries/dictionarySimple';
import { dictionaryWideUniqueKey } from '../sampleDictionaries/dictionaryWideUniqueKey';
import type { WorkerResult } from './reproduceValidationMemoryWorker';
import { CASE3_COUNTS, DATA_DIR, MAX_RECORD_COUNT, RECORD_COUNTS } from './reproduceValidationMemoryConstants';

export { CASE3_COUNTS, DATA_DIR, MAX_RECORD_COUNT, RECORD_COUNTS };

// ─── Data generation helpers ──────────────────────────────────────────────────

function ensureDirectory(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function countFileLines(filePath: string): number {
	const content = fs.readFileSync(filePath, 'utf8');
	return content.trim().split('\n').length - 1;
}

function deleteFile(filePath: string): void {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
}

function fileSizeLabel(filePath: string): string {
	const bytes = fs.statSync(filePath).size;
	if (bytes >= 1_073_741_824) {
		return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
	}
	if (bytes >= 1_048_576) {
		return `${(bytes / 1_048_576).toFixed(2)} MB`;
	}
	return `${(bytes / 1024).toFixed(2)} KB`;
}

function writeSummaryFile(
	outputDir: string,
	entries: { fileName: string; schemaSourcePath: string; recordCount: number; errorRecordCount: number }[],
): void {
	const lines: string[] = [
		'# Generation Summary',
		'',
		'| File | Schema | Records | Generation Errors |',
		'| ---- | ------ | ------: | ----------------: |',
	];
	for (const entry of entries) {
		const errors = entry.errorRecordCount > 0 ? entry.errorRecordCount.toLocaleString() : '0';
		lines.push(`| ${entry.fileName} | ${entry.schemaSourcePath} | ${entry.recordCount.toLocaleString()} | ${errors} |`);
	}
	lines.push('');
	fs.writeFileSync(path.join(outputDir, 'generation-summary.md'), lines.join('\n'));
}

async function ensureSchemaFile(
	schema: Schema,
	schemaSourcePath: string,
	outputDir: string,
	expectedCount: number,
): Promise<string> {
	ensureDirectory(outputDir);
	const filePath = path.join(outputDir, `${schema.name}.tsv`);

	if (fs.existsSync(filePath)) {
		const actualCount = countFileLines(filePath);
		if (actualCount >= expectedCount) {
			console.log(`  [EXISTING] ${filePath} (${actualCount.toLocaleString()} records, ${fileSizeLabel(filePath)})`);
			return filePath;
		}
		console.log(
			`  [STALE]    ${filePath} (${actualCount.toLocaleString()} records, expected ${expectedCount.toLocaleString()}) — regenerating`,
		);
		deleteFile(filePath);
	}

	const result = await generateSchemaFile(schema, outputDir, 'tsv', { count: expectedCount, uniqueKeyRetries: 100 });
	if (!result.success) {
		throw new Error(`Failed to generate ${filePath}: ${result.message}`);
	}
	const report = result.data.schemas[0];
	const errorRecordCount = report?.errorRecordCount ?? 0;
	const errorSuffix = errorRecordCount > 0 ? `, ${errorRecordCount.toLocaleString()} generation errors` : '';
	console.log(
		`  [GENERATED] ${filePath} (${expectedCount.toLocaleString()} records, ${fileSizeLabel(filePath)}${errorSuffix})`,
	);
	writeSummaryFile(outputDir, [
		{ fileName: `${schema.name}.tsv`, schemaSourcePath, recordCount: expectedCount, errorRecordCount },
	]);
	return filePath;
}

async function ensureDictionaryFiles(
	dictionary: Dictionary,
	schemaSourcePaths: Record<string, string>,
	outputDir: string,
	counts: Record<string, number>,
): Promise<void> {
	ensureDirectory(outputDir);

	const schemaNames = Object.keys(counts).filter((name) => counts[name] > 0);
	const allFilesValid = schemaNames.every((schemaName) => {
		const filePath = path.join(outputDir, `${schemaName}.tsv`);
		return fs.existsSync(filePath) && countFileLines(filePath) >= counts[schemaName];
	});

	if (allFilesValid) {
		schemaNames.forEach((schemaName) => {
			const filePath = path.join(outputDir, `${schemaName}.tsv`);
			console.log(
				`  [EXISTING] ${filePath} (${countFileLines(filePath).toLocaleString()} records, ${fileSizeLabel(filePath)})`,
			);
		});
		return;
	}

	schemaNames.forEach((schemaName) => deleteFile(path.join(outputDir, `${schemaName}.tsv`)));

	const result = await generateDictionaryFiles(dictionary, outputDir, 'tsv', { counts, uniqueKeyRetries: 100 });
	if (!result.success) {
		throw new Error(`Failed to generate dictionary files in ${outputDir}: ${result.message}`);
	}
	const reportBySchema = new Map(result.data.schemas.map((report) => [report.schemaName, report]));
	const summaryEntries: {
		fileName: string;
		schemaSourcePath: string;
		recordCount: number;
		errorRecordCount: number;
	}[] = [];
	schemaNames.forEach((schemaName) => {
		const filePath = path.join(outputDir, `${schemaName}.tsv`);
		const report = reportBySchema.get(schemaName);
		const errorRecordCount = report?.errorRecordCount ?? 0;
		const errorSuffix = errorRecordCount > 0 ? `, ${errorRecordCount.toLocaleString()} generation errors` : '';
		console.log(
			`  [GENERATED] ${filePath} (${counts[schemaName].toLocaleString()} records, ${fileSizeLabel(filePath)}${errorSuffix})`,
		);
		summaryEntries.push({
			fileName: `${schemaName}.tsv`,
			schemaSourcePath: schemaSourcePaths[schemaName] ?? '',
			recordCount: counts[schemaName] ?? 0,
			errorRecordCount,
		});
	});
	writeSummaryFile(outputDir, summaryEntries);
}

async function ensureDataFiles(): Promise<void> {
	console.log('\n=== Data Generation ===\n');
	await ensureSchemaFile(
		dictionarySimple.schemas[0],
		'scripts/src/sampleDictionaries/dictionarySimple/schemaAllTypesNoRestrictions.ts',
		path.join(DATA_DIR, 'case1'),
		MAX_RECORD_COUNT,
	);
	await ensureSchemaFile(
		dictionaryWideUniqueKey.schemas[0],
		'scripts/src/sampleDictionaries/dictionaryWideUniqueKey/schemaWideEntity.ts',
		path.join(DATA_DIR, 'case2'),
		MAX_RECORD_COUNT,
	);
	await ensureDictionaryFiles(
		dictionaryMultiRelationship,
		{
			program: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaProgram.ts',
			study: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaStudy.ts',
			institution: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaInstitution.ts',
			lab: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaLab.ts',
			cohort: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaCohort.ts',
			enrollment: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaEnrollment.ts',
			observation: 'scripts/src/sampleDictionaries/dictionaryMultiRelationship/schemaObservation.ts',
		},
		path.join(DATA_DIR, 'case3'),
		CASE3_COUNTS,
	);
}

// ─── Validation orchestration ─────────────────────────────────────────────────

/**
 * Returns the RSS (Resident Set Size) in MB for the given PID by invoking `ps`.
 * Works on macOS and Linux. Returns `undefined` if the process has exited or ps fails.
 *
 * Note: RSS is polled from the orchestrator process while the worker runs, so it captures
 * memory across the entire worker process — not just the V8 heap. This is used to measure
 * peak memory during the validation phase, which is more accurate than sampling V8 heapUsed
 * after the call (where GC may have already reclaimed memory).
 */
function getProcessRssMB(pid: number): number | undefined {
	const result = spawnSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8', timeout: 200 });
	if (result.status !== 0 || result.stdout === null) {
		return undefined;
	}
	const rssKb = parseInt(String(result.stdout).trim(), 10);
	return isNaN(rssKb) ? undefined : Math.round((rssKb / 1024) * 10) / 10;
}

const TABLE_COLUMNS = [
	'Case',
	'Dictionary',
	'Records',
	'Startup (MB)',
	'After Parse (MB)',
	'Peak Validate (MB)',
	'Time (s)',
	'ms/record',
	'Errors',
	'Status',
];
const COLUMN_WIDTHS = [6, 20, 10, 13, 16, 20, 10, 11, 10, 8];

function formatRow(values: string[]): string {
	return '| ' + values.map((value, index) => value.padEnd(COLUMN_WIDTHS[index])).join(' | ') + ' |';
}

function printTableHeader(): void {
	console.log('\n=== Validation Results ===\n');
	console.log(formatRow(TABLE_COLUMNS));
	console.log('| ' + COLUMN_WIDTHS.map((width) => '-'.repeat(width)).join(' | ') + ' |');
}

function printResultRow(result: WorkerResult, startupHeapMB: number, peakValidationMB: number): void {
	const values =
		result.status === 'OK' ?
			[
				result.caseLabel,
				result.caseName,
				result.recordCount.toLocaleString(),
				startupHeapMB.toFixed(1),
				result.heapAfterParseMB.toFixed(1),
				Math.max(peakValidationMB, result.heapAfterValidationMB).toFixed(1),
				(result.elapsedMs / 1000).toFixed(3),
				result.msPerRecord.toFixed(4),
				result.errorCount.toLocaleString(),
				'OK',
			]
		:	[
				result.caseLabel,
				result.caseName,
				result.recordCount.toLocaleString(),
				startupHeapMB.toFixed(1),
				'-',
				'-',
				'-',
				'-',
				'-',
				result.status,
			];
	console.log(formatRow(values));
}

const WORKER_HEAP_LIMIT_MB = Number(process.env['WORKER_HEAP_LIMIT_MB'] ?? 512);
const WORKER_PATH = path.resolve(__dirname, '..', '..', 'dist', 'performance', 'reproduceValidationMemoryWorker.js');
const LOG_DIR = path.resolve(__dirname, 'reproduceValidationMemory-logs');

let currentChild: ChildProcess | undefined;

function killCurrentChild(): void {
	if (currentChild !== undefined) {
		currentChild.kill();
		currentChild = undefined;
	}
}

process.on('SIGINT', () => {
	killCurrentChild();
	process.exit(130);
});
process.on('SIGTERM', () => {
	killCurrentChild();
	process.exit(143);
});

type WorkerRun = { result: WorkerResult; startupHeapMB: number; peakValidationMB: number };

async function runWorker(caseNumber: number, recordCount: number): Promise<WorkerRun> {
	ensureDirectory(LOG_DIR);
	const logPath = path.join(LOG_DIR, `case${caseNumber}-${recordCount}.log`);
	const logLines: string[] = [`case=${caseNumber} records=${recordCount} heap-limit=${WORKER_HEAP_LIMIT_MB}MB`];

	const child = spawn(
		process.execPath,
		[`--max-old-space-size=${WORKER_HEAP_LIMIT_MB}`, WORKER_PATH, String(caseNumber), String(recordCount)],
		{ cwd: path.dirname(WORKER_PATH) },
	);
	currentChild = child;

	// Poll the worker's RSS from the orchestrator while validation runs. Validation is
	// synchronous in the worker — its event loop is blocked — so polling cannot happen
	// inside the worker process itself. The worker writes "validate_start" to stderr when
	// parsing is done and validation is about to begin; we only track peak from that point.
	let peakValidationMB = 0;
	let trackingValidation = false;
	const childPid = child.pid;
	const rssPoller =
		childPid !== undefined ?
			setInterval(() => {
				if (!trackingValidation) {
					return;
				}
				const rssMB = getProcessRssMB(childPid);
				if (rssMB !== undefined && rssMB > peakValidationMB) {
					peakValidationMB = rssMB;
				}
			}, 50)
		:	undefined;

	let stdout = '';
	let stderr = '';
	child.stdout.on('data', (chunk: Buffer) => {
		stdout += chunk.toString('utf8');
	});
	child.stderr.on('data', (chunk: Buffer) => {
		const text = chunk.toString('utf8');
		stderr += text;
		if (text.includes('validate_start')) {
			trackingValidation = true;
		}
	});

	const { exitCode, signal } = await new Promise<{ exitCode: number | null; signal: string | null }>((resolve) => {
		child.on('close', (code, sig) => resolve({ exitCode: code, signal: sig }));
	});
	if (rssPoller !== undefined) {
		clearInterval(rssPoller);
	}
	currentChild = undefined;

	logLines.push(`exit status=${exitCode} signal=${signal}`);
	if (stderr.trim().length > 0) {
		logLines.push(`stderr:\n${stderr.trim()}`);
	}
	if (stdout.trim().length > 0) {
		logLines.push(`stdout:\n${stdout.trim()}`);
	}

	// The worker writes "startup heap=<N>MB" as the first stderr line.
	const startupHeapMB = parseFloat(stderr.match(/startup heap=([\d.]+)MB/)?.[1] ?? '0');

	const CASE_NAMES: Record<number, string> = { 1: 'simple', 2: 'wide-unique-key', 3: 'multi-relationship' };
	const caseName = CASE_NAMES[caseNumber] ?? String(caseNumber);

	const isOomKill = exitCode === 134 || signal === 'SIGKILL' || signal === 'SIGABRT';
	if (isOomKill) {
		logLines.push('result: OOM');
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return {
			result: { status: 'OOM', caseLabel: String(caseNumber), caseName, recordCount },
			startupHeapMB,
			peakValidationMB,
		};
	}

	const lastLine = stdout.trim().split('\n').filter(Boolean).at(-1) ?? '';
	try {
		const result = JSON.parse(lastLine) as WorkerResult;
		logLines.push(`result: ${result.status}`);
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return { result, startupHeapMB, peakValidationMB };
	} catch {
		logLines.push(`failed to parse result JSON from last stdout line: ${JSON.stringify(lastLine)}`);
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return {
			result: { status: 'OOM', caseLabel: String(caseNumber), caseName, recordCount },
			startupHeapMB,
			peakValidationMB,
		};
	}
}

async function runValidationCases(): Promise<void> {
	printTableHeader();

	for (const caseNumber of [1, 2, 3]) {
		for (const recordCount of RECORD_COUNTS) {
			const { result, startupHeapMB, peakValidationMB } = await runWorker(caseNumber, recordCount);
			printResultRow(result, startupHeapMB, peakValidationMB);
			if (result.status === 'OOM') {
				break;
			}
		}
	}

	console.log('');
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	await ensureDataFiles();
	await runValidationCases();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

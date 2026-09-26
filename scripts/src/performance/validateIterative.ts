/**
 * Orchestrator entry point for the iterative validation benchmark.
 *
 * Phase 1: Ensures test data TSV files exist in the shared data directory,
 *          generating them if absent or stale (delegates to reproduceValidationMemory).
 *
 * Phase 2: For each case and record count, spawns a child process running
 *          validateIterativeWorker.ts. Each worker streams the TSV one record at a time,
 *          parsing and submitting to the iterative DictionaryValidator/SchemaValidator
 *          without loading the full dataset into memory. The orchestrator polls the
 *          worker's RSS continuously for the duration of the run to capture peak memory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { ensureDataFiles } from './reproduceValidationMemory';
import { CASE3_RECORD_COUNTS, DATA_DIR, MAX_RECORD_COUNT, RECORD_COUNTS } from './reproduceValidationMemoryConstants';
import type { IterativeWorkerResult } from './validateIterativeWorker';

export { CASE3_RECORD_COUNTS, DATA_DIR, MAX_RECORD_COUNT, RECORD_COUNTS };

// ─── RSS polling ──────────────────────────────────────────────────────────────

/**
 * Returns the RSS (Resident Set Size) in MB for the given PID by invoking `ps`.
 * Works on macOS and Linux. Returns `undefined` if the process has exited or ps fails.
 */
function getProcessRssMB(pid: number): number | undefined {
	const result = spawnSync('ps', ['-o', 'rss=', '-p', String(pid)], { encoding: 'utf8', timeout: 200 });
	if (result.status !== 0 || result.stdout === null) {
		return undefined;
	}
	const rssKb = parseInt(String(result.stdout).trim(), 10);
	return isNaN(rssKb) ? undefined : Math.round((rssKb / 1024) * 10) / 10;
}

// ─── Table formatting ─────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
	'Case',
	'Dictionary',
	'Err Rate',
	'Records',
	'Total Rec',
	'Startup (MB)',
	'Peak Heap (MB)',
	'Peak RSS (MB)',
	'Time (s)',
	'ms/record',
	'Errors',
	'Status',
];
const COLUMN_WIDTHS = [6, 20, 8, 10, 10, 13, 14, 13, 10, 11, 10, 8];

function formatRow(values: string[]): string {
	return '| ' + values.map((value, index) => value.padEnd(COLUMN_WIDTHS[index])).join(' | ') + ' |';
}

function printTableHeader(): void {
	console.log('\n=== Iterative Validation Results ===\n');
	console.log(formatRow(TABLE_COLUMNS));
	console.log('| ' + COLUMN_WIDTHS.map((width) => '-'.repeat(width)).join(' | ') + ' |');
}

function printResultRow(
	result: IterativeWorkerResult,
	startupHeapMB: number,
	peakRssMB: number,
	withErrors: boolean,
): void {
	const errorRateLabel = withErrors ? '10%' : '0%';
	const values =
		result.status === 'OK' ?
			[
				result.caseLabel,
				result.caseName,
				errorRateLabel,
				result.inputCount.toLocaleString(),
				result.recordCount.toLocaleString(),
				startupHeapMB.toFixed(1),
				result.peakHeapMB.toFixed(1),
				peakRssMB.toFixed(1),
				(result.elapsedMs / 1000).toFixed(3),
				result.msPerRecord.toFixed(4),
				result.errorCount.toLocaleString(),
				'OK',
			]
		:	[
				result.caseLabel,
				result.caseName,
				errorRateLabel,
				result.inputCount.toLocaleString(),
				'-',
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

// ─── Worker orchestration ─────────────────────────────────────────────────────

const WORKER_HEAP_LIMIT_MB = Number(process.env['WORKER_HEAP_LIMIT_MB'] ?? 512);
const WORKER_PATH = path.resolve(__dirname, '..', '..', 'dist', 'performance', 'validateIterativeWorker.js');
const LOG_DIR = path.resolve(__dirname, 'validateIterative-logs');

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

function ensureDirectory(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

type WorkerRun = { result: IterativeWorkerResult; startupHeapMB: number; peakRssMB: number };

async function runWorker(caseNumber: number, recordCount: number, withErrors: boolean): Promise<WorkerRun> {
	ensureDirectory(LOG_DIR);
	const errorsSuffix = withErrors ? '-errors' : '';
	const logPath = path.join(LOG_DIR, `case${caseNumber}-${recordCount}${errorsSuffix}.log`);
	const logLines: string[] = [
		`case=${caseNumber} records=${recordCount} errors=${withErrors} heap-limit=${WORKER_HEAP_LIMIT_MB}MB`,
	];

	const workerArgs = [
		`--max-old-space-size=${WORKER_HEAP_LIMIT_MB}`,
		WORKER_PATH,
		String(caseNumber),
		String(recordCount),
	];
	if (withErrors) {
		workerArgs.push('errors');
	}
	const child = spawn(process.execPath, workerArgs, { cwd: path.dirname(WORKER_PATH) });
	currentChild = child;

	// Poll the worker's RSS from the orchestrator for the entire duration of the run.
	// Since the iterative worker interleaves parse and validate in a single streaming loop,
	// there is no distinct parse phase — peak memory reflects the steady-state of processing.
	// RSS tracking begins as soon as the worker signals validate_start (sent immediately
	// before the streaming loop) and continues until the process exits.
	let peakRssMB = 0;
	let trackingMemory = false;
	const childPid = child.pid;
	const rssPoller =
		childPid !== undefined ?
			setInterval(() => {
				if (!trackingMemory) {
					return;
				}
				const rssMB = getProcessRssMB(childPid);
				if (rssMB !== undefined && rssMB > peakRssMB) {
					peakRssMB = rssMB;
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
			trackingMemory = true;
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

	const startupHeapMB = parseFloat(stderr.match(/startup heap=([\d.]+)MB/)?.[1] ?? '0');

	const CASE_NAMES: Record<number, string> = { 1: 'simple', 2: 'wide-unique-key', 3: 'multi-relationship' };
	const caseName = CASE_NAMES[caseNumber] ?? String(caseNumber);

	const isOomKill = exitCode === 134 || signal === 'SIGKILL' || signal === 'SIGABRT';
	if (isOomKill) {
		logLines.push('result: OOM');
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return {
			result: { status: 'OOM', caseLabel: String(caseNumber), caseName, inputCount: recordCount, recordCount },
			startupHeapMB,
			peakRssMB,
		};
	}

	const lastLine = stdout.trim().split('\n').filter(Boolean).at(-1) ?? '';
	try {
		const result = JSON.parse(lastLine) as IterativeWorkerResult;
		logLines.push(`result: ${result.status}`);
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return { result, startupHeapMB, peakRssMB };
	} catch {
		logLines.push(`failed to parse result JSON from last stdout line: ${JSON.stringify(lastLine)}`);
		fs.writeFileSync(logPath, logLines.join('\n') + '\n');
		return {
			result: { status: 'OOM', caseLabel: String(caseNumber), caseName, inputCount: recordCount, recordCount },
			startupHeapMB,
			peakRssMB,
		};
	}
}

async function runValidationCases(): Promise<void> {
	printTableHeader();

	for (const caseNumber of [1, 2]) {
		for (const recordCount of RECORD_COUNTS) {
			const { result, startupHeapMB, peakRssMB } = await runWorker(caseNumber, recordCount, false);
			printResultRow(result, startupHeapMB, peakRssMB, false);
			if (result.status === 'OOM') {
				break;
			}
		}
	}

	for (const recordCount of RECORD_COUNTS) {
		const { result, startupHeapMB, peakRssMB } = await runWorker(2, recordCount, true);
		printResultRow(result, startupHeapMB, peakRssMB, true);
		if (result.status === 'OOM') {
			break;
		}
	}

	for (const withErrors of [false, true]) {
		for (const recordCount of CASE3_RECORD_COUNTS) {
			const { result, startupHeapMB, peakRssMB } = await runWorker(3, recordCount, withErrors);
			printResultRow(result, startupHeapMB, peakRssMB, withErrors);
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

import path from 'node:path';

// Resolves to scripts/src/performance/reproduceValidationMemory-data/ regardless of whether
// this file is run via ts-node (where __dirname is src/performance/) or compiled JS (where __dirname is dist/performance/).
export const DATA_DIR = path.resolve(__dirname, '..', '..', 'src', 'performance', 'reproduceValidationMemory-data');
export const MAX_RECORD_COUNT = 1_000_000;
export const RECORD_COUNTS = [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export const CASE3_COUNTS = {
	program: MAX_RECORD_COUNT,
	study: MAX_RECORD_COUNT * 5,
	institution: MAX_RECORD_COUNT,
	lab: MAX_RECORD_COUNT * 2,
	cohort: MAX_RECORD_COUNT * 10,
	enrollment: MAX_RECORD_COUNT * 3,
	observation: MAX_RECORD_COUNT * 5,
};

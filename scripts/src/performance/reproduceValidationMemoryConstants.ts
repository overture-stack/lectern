import path from 'node:path';

// Resolves to scripts/src/performance/reproduceValidationMemory-data/ regardless of whether
// this file is run via ts-node (where __dirname is src/performance/) or compiled JS (where __dirname is dist/performance/).
export const DATA_DIR = path.resolve(__dirname, '..', '..', 'src', 'performance', 'reproduceValidationMemory-data');
export const MAX_RECORD_COUNT = 1_000_000;
export const RECORD_COUNTS = [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
export const ERROR_RATE = 0.1;

/**
 * Record counts used for case 3 (multi-schema with FK relationships).
 * Capped at 250,000 to avoid prohibitively large total dataset sizes given the
 * per-schema multipliers applied to the base count.
 */
export const CASE3_RECORD_COUNTS = [100, 1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

/**
 * Per-schema record count multipliers for case 3 (dictionaryMultiRelationship).
 * The actual count for each schema is `baseCount * multiplier`, where `baseCount`
 * is the per-test-case record count being benchmarked.
 */
export const CASE3_SCHEMA_MULTIPLIERS: Record<string, number> = {
	program: 1,
	study: 5,
	institution: 1,
	lab: 2,
	cohort: 10,
	enrollment: 3,
	observation: 5,
};

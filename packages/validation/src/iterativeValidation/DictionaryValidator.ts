/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { failWith, success, type Dictionary, type Result } from '@overture-stack/lectern-dictionary';
import { assert } from '../utils/assert';
import { invalid, valid, type TestResult } from '../types';
import type { CrossRecordValidationError, UniqueFieldViolationCount } from './CrossRecordValidator';
import {
	CrossSchemaValidator,
	type CrossSchemaValidationError,
	type ForeignKeyViolationCount,
} from './CrossSchemaValidator';
import { SchemaValidator, type SchemaValidatorRecordTestResult } from './SchemaValidator';
import type { ValidatorRecordEntry } from './submissionTypes';

/**
 * Aggregated error counts for a single schema within the dictionary.
 */
export type DictionarySchemaValidationCounts = {
	/**
	 * Total number of records accepted for this schema (excludes duplicates).
	 */
	recordCount: number;

	/**
	 * Number of records that had one or more field or record-level validation errors.
	 */
	recordErrorCount: number;

	/**
	 * Breakdown of cross-record and cross-schema constraint violations.
	 */
	errorCounts: {
		unique: UniqueFieldViolationCount[];
		uniqueKey: number;
		foreignKey: ForeignKeyViolationCount[];
	};
};

/**
 * Report details returned by DictionaryValidator when violations are found.
 */
export type DictionaryValidatorReport = {
	/**
	 * Number of `submit()` calls that were rejected due to an unrecognized schema name.
	 */
	unknownSchemaCount: number;

	/**
	 * Per-schema aggregated counts for all schemas in the dictionary.
	 */
	schemaCounts: Record<string, DictionarySchemaValidationCounts>;
};

/**
 * Union of error types that can be yielded by `DictionaryValidator.errors()`.
 */
export type DictionaryValidatorError = CrossRecordValidationError | CrossSchemaValidationError;

/**
 * Internal running counters maintained per schema.
 */
type SchemaRunningCounters = {
	recordCount: number;
	recordErrorCount: number;
};

/**
 * Validates records from any schema in a dictionary, enforcing field-level rules,
 * uniqueness constraints, and foreignKey restrictions across all submitted records.
 *
 * Records are submitted one at a time or in batches via `submit(schemaName, entry)`.
 * Field-level errors are returned immediately from each `submit()` call. Uniqueness
 * and foreignKey violations — which require data from multiple records — are evaluated
 * after all records have been submitted, via `report()` and `errors()`.
 *
 * Lifecycle: `new DictionaryValidator(dictionary)` -> `submit(schemaName, entry)` -> `report()` / `errors()`
 *
 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
 * - Returns `failure` with `DUPLICATE_ID` if the same `id` is submitted twice for the same schema.
 * - Returns `failure` with `LOCKED` while the `errors()` generator is active.
 * - ID uniqueness is per-schema: the same `id` may be used for records in different schemas.
 *
 * @example
 * const validator = new DictionaryValidator(dictionary);
 *
 * for (const [schemaName, records] of schemaData.entries()) {
 *   for (const [rowIndex, record] of records.entries()) {
 *     const result = validator.submit(schemaName, { id: String(rowIndex), data: record });
 *     if (result.success) {
 *       for (const { id, valid, details } of result.data) {
 *         if (!valid) { console.warn(`Row ${id} in ${schemaName} has ${details.length} error(s)`); }
 *       }
 *     } else {
 *       console.warn(`Row ${rowIndex} in ${schemaName} skipped: ${result.data.error}`);
 *     }
 *   }
 * }
 *
 * const report = validator.report();
 * if (!report.valid) {
 *   for (const error of validator.errors()) {
 *     console.error(error);
 *   }
 * }
 */
export class DictionaryValidator {
	private readonly schemaValidators: Map<string, SchemaValidator>;
	private readonly crossSchemaValidator: CrossSchemaValidator;
	private readonly perSchemaCounts: Map<string, SchemaRunningCounters>;
	private unknownSchemaCount: number;
	private activeGeneratorCount: number;

	constructor(dictionary: Dictionary) {
		this.unknownSchemaCount = 0;
		this.activeGeneratorCount = 0;
		this.schemaValidators = new Map();
		this.perSchemaCounts = new Map();
		this.crossSchemaValidator = new CrossSchemaValidator(dictionary);

		for (const schema of dictionary.schemas) {
			this.schemaValidators.set(schema.name, new SchemaValidator(schema));
			this.perSchemaCounts.set(schema.name, { recordCount: 0, recordErrorCount: 0 });
		}
	}

	/**
	 * Submit one or more records for a named schema.
	 *
	 * Each record is immediately validated against the schema and its field values are
	 * added to the cross-record and cross-schema indices. Per-record errors are returned
	 * in the success data and never stored internally.
	 *
	 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
	 *   The unknown schema submission is counted in `report()`.
	 * - Returns `failure` with `DUPLICATE_ID` if any submitted ID was already seen for this schema.
	 * - Returns `failure` with `LOCKED` if the `errors()` generator is currently active.
	 * - In batch submission, if any entry fails the call immediately returns the failure and
	 *   no further entries in that batch are processed.
	 */
	submit(
		schemaName: string,
		entry: ValidatorRecordEntry | ValidatorRecordEntry[],
	): Result<SchemaValidatorRecordTestResult[], { error: 'UNKNOWN_SCHEMA' | 'DUPLICATE_ID' | 'LOCKED' }> {
		if (this.activeGeneratorCount > 0) {
			return failWith<{ error: 'LOCKED' }>(`Cannot submit records while the errors() generator is running.`, {
				error: 'LOCKED',
			});
		}

		const schemaValidator = this.schemaValidators.get(schemaName);
		if (!schemaValidator) {
			this.unknownSchemaCount++;
			return failWith<{ error: 'UNKNOWN_SCHEMA' }>(`${schemaName} is not a known schema in this dictionary.`, {
				error: 'UNKNOWN_SCHEMA',
			});
		}

		const schemaResult = schemaValidator.submit(entry);
		if (!schemaResult.success) {
			// Failed to submit to schema validator, DUPLICATE_ID or LOCKED
			return schemaResult;
		}

		const counters = this.perSchemaCounts.get(schemaName);
		assert(
			counters,
			`Unexpected error: invariant violation in DictionaryValidator.submit(). No running counters exist for schema "${schemaName}", which was expected to be populated at construction time.`,
		);
		for (const recordResult of schemaResult.data) {
			counters.recordCount++;
			if (!recordResult.valid) {
				counters.recordErrorCount++;
			}
		}

		// Submit the same entries to the cross-schema validator for FK tracking.
		// This always succeeds because the schemaValidator already accepted the IDs
		// (duplicate and locked checks have already passed above).
		this.crossSchemaValidator.submit(schemaName, entry);

		return success(schemaResult.data);
	}

	/**
	 * Generate a report of all validation results seen so far.
	 *
	 * Returns `valid()` when all submitted records pass all constraints and no submissions
	 * used an unrecognized schema name. Returns `invalid({ details })` with per-schema
	 * aggregate counts otherwise.
	 *
	 * May be called at any time. Calling `report()` does not affect the validator's state.
	 */
	report(): TestResult<DictionaryValidatorReport> {
		let isValid = this.unknownSchemaCount === 0;

		const crossSchemaReport = this.crossSchemaValidator.report();
		if (!crossSchemaReport.valid) {
			isValid = false;
		}

		const schemaCounts: Record<string, DictionarySchemaValidationCounts> = {};

		for (const [schemaName, schemaValidator] of this.schemaValidators) {
			const counters = this.perSchemaCounts.get(schemaName);
			const recordCount = counters?.recordCount ?? 0;
			const recordErrorCount = counters?.recordErrorCount ?? 0;

			if (recordErrorCount > 0) {
				isValid = false;
			}

			const schemaReport = schemaValidator.report();
			let unique: UniqueFieldViolationCount[] = [];
			let uniqueKey = 0;

			if (!schemaReport.valid) {
				isValid = false;
				unique = schemaReport.details.crossRecordErrorCounts.unique;
				uniqueKey = schemaReport.details.crossRecordErrorCounts.uniqueKey;
			}

			let foreignKey: ForeignKeyViolationCount[] = [];
			if (!crossSchemaReport.valid) {
				const fkEntry = crossSchemaReport.details.foreignKey.find((entry) => entry.schemaName === schemaName);
				if (fkEntry) {
					foreignKey = fkEntry.counts;
				}
			}

			schemaCounts[schemaName] = {
				recordCount,
				recordErrorCount,
				errorCounts: { unique, uniqueKey, foreignKey },
			};
		}

		if (isValid) {
			return valid();
		}
		return invalid({ unknownSchemaCount: this.unknownSchemaCount, schemaCounts });
	}

	/**
	 * Generator that yields one error object per cross-record or cross-schema violation.
	 *
	 * Yields cross-record (`unique`, `uniqueKey`) violations from each schema's
	 * `CrossRecordValidator` in sequence, then cross-schema (`foreignKey`) violations
	 * from the shared `CrossSchemaValidator`.
	 *
	 * Locks `submit()` for the duration of iteration — `submit()` will return a `LOCKED`
	 * failure until all active generators are fully consumed or their `return()` method is called.
	 */
	*errors(): Generator<DictionaryValidatorError> {
		this.activeGeneratorCount++;
		try {
			for (const schemaValidator of this.schemaValidators.values()) {
				yield* schemaValidator.errors();
			}
			yield* this.crossSchemaValidator.errors();
		} finally {
			this.activeGeneratorCount--;
		}
	}
}

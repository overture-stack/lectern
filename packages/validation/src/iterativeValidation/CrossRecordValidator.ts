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

import { assert } from '../utils/assert';
import {
	TypeUtils,
	failWith,
	success,
	type DataRecord,
	type DataRecordValue,
	type Result,
	type Schema,
} from '@overture-stack/lectern-dictionary';
import { hashDataRecord } from '../utils/hashDataRecord';
import { getUniqueKeyValues } from '../validateSchema/restrictions/uniqueKey/getUniqueKeyValues';
import type {
	SchemaValidationRecordErrorUnique,
	SchemaValidationRecordErrorUniqueKey,
} from '../validateSchema/SchemaValidationError';
import type { ValidatorOptions, ValidatorRecordEntry } from './submissionTypes';

/**
 * Count of records violating a unique field constraint for a specific field.
 * The count represents the total number of records involved in unique violations
 * for that field (i.e. records that share a value with at least one other record).
 */
export type UniqueFieldViolationCount = {
	fieldName: string;
	count: number;
};

/**
 * Aggregated counts of cross-record constraint violations.
 */
export type CrossRecordErrorCounts = {
	/**
	 * Per-field counts of records involved in unique value violations.
	 */
	unique: UniqueFieldViolationCount[];

	/**
	 * Total number of records involved in uniqueKey violations.
	 * Records are counted once per uniqueKey collision group they participate in.
	 */
	uniqueKey: number;
};

/**
 * Report output from the CrossRecordValidator.
 */
export type CrossRecordReport = {
	/**
	 * True when no unique or uniqueKey violations were detected.
	 */
	valid: boolean;

	/**
	 * Total number of records that were successfully submitted (excluding duplicates).
	 */
	recordCount: number;

	/**
	 * Aggregated counts of constraint violations. All counts are zero when valid is true.
	 */
	errorCounts: CrossRecordErrorCounts;
};

export type CrossRecordValidationError = SchemaValidationRecordErrorUnique | SchemaValidationRecordErrorUniqueKey;

/**
 * Hash map bucket for a uniqueKey constraint.
 * Stores the composite key values alongside the IDs of all records that share that composite key.
 */
type UniqueKeyBucket = {
	values: DataRecord;
	ids: string[];
};

/**
 * CrossRecordValidator validates schema restrictions that require data from multiple records. These
 * "cross-record constraints" include unique fields and schema level uniqueKey restrictions. It does
 * not provide any other validation for records.
 *
 * This validator is stateful. After creation, it accepts individual records, or small batches of records,
 * and it maintains a lightweight hash indices to detect violations across all submitted records.
 *
 * This validator does not retain full record data.
 * Instead it stores only the hashes and IDs needed to detect duplicate values, making it
 * suitable for large datasets that would not fit entirely in memory.
 *
 * Field-level and record-level validation are NOT performed by this validator. Use
 * `SchemaValidator` when those checks are also needed.
 *
 * Lifecycle: `new CrossRecordValidator(schema)` -> `submit()` -> `report()` / `errors()`
 *
 * - Records may be submitted at any time; `report()` may also be called at any time.
 * - Calling `report()` does not reset the validator; subsequent submissions will be reflected
 *   in later calls to `report()`.
 * - By default, duplicate IDs are accepted and each is treated as a separate submission, so a
 *   repeated record is reported as violating its own `unique` and `uniqueKey` constraints.
 *   Pass `{ rejectDuplicates: true }` to instead return a `DUPLICATE_ID` failure for repeated
 *   IDs, at the memory cost of retaining every submitted ID.
 * - While the `errors()` generator is running, `submit()` returns a `LOCKED` failure.
 *
 * @example
 * const validator = new CrossRecordValidator(schema);
 *
 * for (const [rowIndex, record] of records.entries()) {
 *   const result = validator.submit({ id: String(rowIndex), data: record });
 *   if (!result.success) {
 *     console.warn(`Row ${rowIndex} skipped: ${result.data.error}`);
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
export class CrossRecordValidator {
	private readonly uniqueFieldNames: string[];
	private readonly uniqueKeyRule: string[] | undefined;

	/**
	 * True when the schema has at least one unique field or a uniqueKey restriction.
	 * When false, there is nothing to track cross-record, so all per-record state
	 * (seenIds, hash indices) is skipped entirely to avoid O(N) memory growth.
	 */
	private readonly hasConstraints: boolean;

	/**
	 * Set of submitted record IDs used for duplicate detection.
	 * Only allocated when the `rejectDuplicates` option is true; otherwise `undefined` and
	 * duplicate IDs are processed as separate submissions.
	 */
	private readonly seenIds: Set<string> | undefined;

	/**
	 * Index for unique field constraint tracking.
	 * Structure: fieldName -> (field value -> record IDs with that value)
	 *
	 * The field value is used directly as the Map key so that the value is available
	 * for error reporting without requiring a separate snapshot.
	 */
	private readonly uniqueFieldIndex: Map<string, Map<DataRecordValue, string[]>>;

	/**
	 * Index for uniqueKey constraint tracking.
	 * Structure: hash of composite key values -> { composite key values, record IDs with that composite key }
	 *
	 * The composite key values are stored in each bucket so that violation errors can be reported
	 * with the violating key without requiring a separate per-record snapshot.
	 */
	private readonly uniqueKeyIndex: Map<string, UniqueKeyBucket>;

	private activeGeneratorCount: number;

	/**
	 * Total count of successfully submitted records. Used for `report().recordCount`
	 * in place of `seenIds.size` so that schemas with no constraints (where seenIds
	 * is not populated) still report accurate counts.
	 */
	private submittedCount: number;

	constructor(schema: Schema, options?: ValidatorOptions) {
		this.uniqueFieldNames = schema.fields.filter((field) => field.unique === true).map((field) => field.name);
		this.uniqueKeyRule = schema.restrictions?.uniqueKey;
		this.hasConstraints = this.uniqueFieldNames.length > 0 || this.uniqueKeyRule !== undefined;
		this.seenIds = options?.rejectDuplicates === true ? new Set() : undefined;
		this.uniqueFieldIndex = new Map();
		this.uniqueKeyIndex = new Map();
		this.activeGeneratorCount = 0;
		this.submittedCount = 0;

		for (const fieldName of this.uniqueFieldNames) {
			this.uniqueFieldIndex.set(fieldName, new Map());
		}
	}

	private processEntry(
		id: string,
		data: Record<string, DataRecordValue>,
	): Result<void, { error: 'DUPLICATE_ID' | 'LOCKED' }> {
		if (this.activeGeneratorCount > 0) {
			return failWith<{ error: 'LOCKED' }>(`Cannot submit records while the errors() generator is running.`, {
				error: 'LOCKED',
			});
		}

		if (this.seenIds !== undefined) {
			if (this.seenIds.has(id)) {
				return failWith<{ error: 'DUPLICATE_ID' }>(`${id} has already been submitted.`, { error: 'DUPLICATE_ID' });
			}
			this.seenIds.add(id);
		}
		this.submittedCount++;

		// Schemas with no cross-record constraints need no hash indexing.
		if (!this.hasConstraints) {
			return success(undefined);
		}

		for (const fieldName of this.uniqueFieldNames) {
			const value = data[fieldName];

			if (value === undefined || (Array.isArray(value) && value.length === 0)) {
				continue;
			}

			const fieldHashMap = this.uniqueFieldIndex.get(fieldName);
			assert(
				fieldHashMap,
				`Unexpected error: invariant violation in CrossRecordValidator.processEntry(). No hash map exists for field "${fieldName}", which was expected to be populated at construction time.`,
			);
			const existing = fieldHashMap.get(value);
			if (existing) {
				existing.push(id);
			} else {
				fieldHashMap.set(value, [id]);
			}
		}

		if (this.uniqueKeyRule && this.uniqueKeyRule.length > 0) {
			const uniqueKeyValues = getUniqueKeyValues(data, this.uniqueKeyRule);
			const hash = hashDataRecord(uniqueKeyValues);
			const existing = this.uniqueKeyIndex.get(hash);
			if (existing) {
				existing.ids.push(id);
			} else {
				this.uniqueKeyIndex.set(hash, { values: uniqueKeyValues, ids: [id] });
			}
		}

		return success(undefined);
	}

	/**
	 * Submit one or more records for cross-record constraint tracking.
	 *
	 * Returns a `DUPLICATE_ID` failure if `rejectDuplicates` is enabled and any submitted ID has
	 * already been submitted.
	 * Returns a `LOCKED` failure if the `errors()` generator is currently running.
	 * In batch submission, if any entry fails the call immediately returns the failure and
	 * no further entries in that batch are processed.
	 *
	 * Only `unique` and `uniqueKey` field values are stored; all other field data is discarded.
	 * Field-level and record-level errors are not detected here.
	 */
	submit(entry: ValidatorRecordEntry | ValidatorRecordEntry[]): Result<void, { error: 'DUPLICATE_ID' | 'LOCKED' }> {
		const entries = TypeUtils.asArray(entry);

		for (const { id, data } of entries) {
			const result = this.processEntry(id, data);
			if (!result.success) {
				return result;
			}
		}

		return success(undefined);
	}

	/**
	 * Generate a report of all cross-record constraint violations detected so far.
	 *
	 * May be called at any time. Calling `report()` does not affect the validator's state.
	 */
	report(): CrossRecordReport {
		const recordCount = this.submittedCount;

		const uniqueFieldCounts: UniqueFieldViolationCount[] = [];
		for (const [fieldName, hashMap] of this.uniqueFieldIndex) {
			let count = 0;
			for (const ids of hashMap.values()) {
				if (ids.length > 1) {
					count += ids.length;
				}
			}
			if (count > 0) {
				uniqueFieldCounts.push({ fieldName, count });
			}
		}

		let uniqueKeyCount = 0;
		for (const { ids } of this.uniqueKeyIndex.values()) {
			if (ids.length > 1) {
				uniqueKeyCount += ids.length;
			}
		}

		const isValid = uniqueFieldCounts.length === 0 && uniqueKeyCount === 0;

		return {
			valid: isValid,
			recordCount,
			errorCounts: {
				unique: uniqueFieldCounts,
				uniqueKey: uniqueKeyCount,
			},
		};
	}

	/**
	 * Generator that yields one error object per record that violates a unique or uniqueKey constraint.
	 * Each yielded error includes all record IDs involved in the collision group via `matchingRecords`,
	 * so callers can see the full set of conflicting records from any single error.
	 *
	 * Errors are yielded in hash map iteration order, not submission order.
	 *
	 * Locks the validator for the duration of iteration — `submit()` will return a `LOCKED` failure
	 * until all active generators are fully consumed or their `return()` method is called.
	 */
	*errors(): Generator<CrossRecordValidationError> {
		this.activeGeneratorCount++;
		try {
			for (const [fieldName, hashMap] of this.uniqueFieldIndex) {
				for (const [value, ids] of hashMap.entries()) {
					if (ids.length > 1) {
						for (const _id of ids) {
							yield {
								reason: 'INVALID_BY_UNIQUE',
								fieldName,
								fieldValue: value,
								matchingRecords: ids,
							};
						}
					}
				}
			}

			for (const { values, ids } of this.uniqueKeyIndex.values()) {
				if (ids.length > 1) {
					for (const _id of ids) {
						yield {
							reason: 'INVALID_BY_UNIQUE_KEY',
							matchingRecords: ids,
							uniqueKey: values,
						};
					}
				}
			}
		} finally {
			this.activeGeneratorCount--;
		}
	}
}

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

import { TypeUtils, failWith, success, type DataRecord, type DataRecordValue, type Result, type Schema } from '@overture-stack/lectern-dictionary';
import { hashDataRecord } from '../utils/hashDataRecord';
import { type DataSetHashMap } from '../validateSchema/restrictions/generateDataSetHashMap';
import { testUniqueFieldRestriction } from '../validateSchema/restrictions/uniqueField/testUniqueFieldRestriction';
import { getUniqueKeyValues } from '../validateSchema/restrictions/uniqueKey/getUniqueKeyValues';
import { testUniqueKey } from '../validateSchema/restrictions/uniqueKey/testUniqueKey';
import type {
	SchemaValidationRecordErrorUnique,
	SchemaValidationRecordErrorUniqueKey,
} from '../validateSchema/SchemaValidationError';
import type { ValidatorRecordEntry } from './submissionTypes';

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
 * Minimal per-record snapshot stored by the CrossRecordValidator.
 * Only the field values needed for unique and uniqueKey constraint checking are retained;
 * all other field data is discarded after submission.
 */
type RecordSnapshot = {
	id: string;
	values: DataRecord;
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
 * - Submitting the same ID twice returns a `DUPLICATE_ID` failure. Only the first submission
 *   for a given ID is stored.
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

	private readonly seenIds: Set<string>;
	private readonly snapshots: RecordSnapshot[];

	/**
	 * Index for unique field constraint tracking.
	 * Structure: fieldName -> (hash of field value -> array of record IDs with that value)
	 */
	private readonly uniqueFieldIndex: Map<string, DataSetHashMap>;

	/**
	 * Index for uniqueKey constraint tracking.
	 * Structure: hash of composite key values -> array of record IDs with that composite key
	 */
	private readonly uniqueKeyIndex: DataSetHashMap;

	private activeGeneratorCount: number;

	constructor(schema: Schema) {
		this.seenIds = new Set();
		this.snapshots = [];
		this.uniqueFieldIndex = new Map();
		this.uniqueKeyIndex = new Map();
		this.activeGeneratorCount = 0;

		this.uniqueFieldNames = schema.fields.filter((field) => field.unique === true).map((field) => field.name);

		this.uniqueKeyRule = schema.restrictions?.uniqueKey;

		for (const fieldName of this.uniqueFieldNames) {
			this.uniqueFieldIndex.set(fieldName, new Map());
		}
	}

	private processEntry(id: string, data: Record<string, DataRecordValue>): Result<void, { error: 'DUPLICATE_ID' | 'LOCKED' }> {
		if (this.activeGeneratorCount > 0) {
			return failWith<{ error: 'LOCKED' }>(`Cannot submit records while the errors() generator is running.`, {
				error: 'LOCKED',
			});
		}

		if (this.seenIds.has(id)) {
			return failWith<{ error: 'DUPLICATE_ID' }>(`${id} has already been submitted.`, { error: 'DUPLICATE_ID' });
		}

		this.seenIds.add(id);

		const snapshotValues: DataRecord = {};

		for (const fieldName of this.uniqueFieldNames) {
			const value = data[fieldName];
			snapshotValues[fieldName] = value;

			if (value === undefined || (Array.isArray(value) && value.length === 0)) {
				continue;
			}

			const hash = hashDataRecord({ [fieldName]: value });
			const fieldHashMap = this.uniqueFieldIndex.get(fieldName);
			if (fieldHashMap) {
				const existing = fieldHashMap.get(hash);
				if (existing) {
					existing.push(id);
				} else {
					fieldHashMap.set(hash, [id]);
				}
			}
		}

		if (this.uniqueKeyRule && this.uniqueKeyRule.length > 0) {
			const uniqueKeyValues = getUniqueKeyValues(data, this.uniqueKeyRule);
			for (const fieldName of this.uniqueKeyRule) {
				snapshotValues[fieldName] = data[fieldName];
			}
			const hash = hashDataRecord(uniqueKeyValues);
			const existing = this.uniqueKeyIndex.get(hash);
			if (existing) {
				existing.push(id);
			} else {
				this.uniqueKeyIndex.set(hash, [id]);
			}
		}

		this.snapshots.push({ id, values: snapshotValues });

		return success(undefined);
	}

	/**
	 * Submit one or more records for cross-record constraint tracking.
	 *
	 * Returns a `DUPLICATE_ID` failure if any submitted ID has already been submitted.
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
	 * Calls `testUniqueFieldRestriction` and `testUniqueKey` for each submitted record.
	 *
	 * May be called at any time. Calling `report()` does not affect the validator's state.
	 */
	report(): CrossRecordReport {
		const recordCount = this.seenIds.size;

		const uniqueFieldCounts = new Map<string, number>();
		let uniqueKeyCount = 0;

		for (const { id, values } of this.snapshots) {
			for (const [fieldName, hashMap] of this.uniqueFieldIndex) {
				const result = testUniqueFieldRestriction(values[fieldName], fieldName, hashMap);
				if (!result.valid && result.details.matchingRecords[0] === id) {
					// Only count a violation once — for the first record in the collision group
					const existing = uniqueFieldCounts.get(fieldName) ?? 0;
					uniqueFieldCounts.set(fieldName, existing + result.details.matchingRecords.length);
				}
			}

			if (this.uniqueKeyRule && this.uniqueKeyRule.length > 0) {
				const result = testUniqueKey(values, this.uniqueKeyRule, this.uniqueKeyIndex);
				if (!result.valid && result.details.matchingRecords[0] === id) {
					uniqueKeyCount += result.details.matchingRecords.length;
				}
			}
		}

		const uniqueViolations: UniqueFieldViolationCount[] = [...uniqueFieldCounts.entries()].map(
			([fieldName, count]) => ({ fieldName, count }),
		);

		const isValid = uniqueViolations.length === 0 && uniqueKeyCount === 0;

		return {
			valid: isValid,
			recordCount,
			errorCounts: {
				unique: uniqueViolations,
				uniqueKey: uniqueKeyCount,
			},
		};
	}

	/**
	 * Generator that yields one error object per record that violates a unique or uniqueKey constraint.
	 *
	 * Locks the validator for the duration of iteration — `submit()` will return a `LOCKED` failure
	 * until all active generators are fully consumed or their `return()` method is called.
	 */
	*errors(): Generator<CrossRecordValidationError> {
		this.activeGeneratorCount++;
		try {
			for (const { values } of this.snapshots) {
				for (const [fieldName, hashMap] of this.uniqueFieldIndex) {
					const result = testUniqueFieldRestriction(values[fieldName], fieldName, hashMap);
					if (!result.valid) {
						yield result.details;
					}
				}

				if (this.uniqueKeyRule && this.uniqueKeyRule.length > 0) {
					const result = testUniqueKey(values, this.uniqueKeyRule, this.uniqueKeyIndex);
					if (!result.valid) {
						yield result.details;
					}
				}
			}
		} finally {
			this.activeGeneratorCount--;
		}
	}
}

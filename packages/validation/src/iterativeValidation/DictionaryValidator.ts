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

import {
	TypeUtils,
	failWith,
	success,
	type DataRecord,
	type DataRecordValue,
	type Dictionary,
	type ForeignKeyRestriction,
	type Result,
	type Schema,
} from '@overture-stack/lectern-dictionary';
import { assert } from '../utils/assert';
import { hashDataRecord } from '../utils/hashDataRecord';
import { invalid, valid, type TestResult } from '../types';
import { validateRecord } from '../validateRecord/validateRecord';
import type { RecordValidationError } from '../validateRecord/RecordValidationError';
import type { SchemaDataReference } from '../validateDictionary/collectSchemaReferenceData';
import { testForeignKeyRestriction } from '../validateDictionary/testForeignKeyRestriction';
import { getUniqueKeyValues } from '../validateSchema/restrictions/uniqueKey/getUniqueKeyValues';
import type {
	SchemaValidationRecordErrorUnique,
	SchemaValidationRecordErrorUniqueKey,
} from '../validateSchema/SchemaValidationError';
import type { CrossRecordValidationError, UniqueFieldViolationCount } from './CrossRecordValidator';
import type { CrossSchemaValidationError, ForeignKeyViolationCount } from './CrossSchemaValidator';
import type { ValidatorOptions, ValidatorRecordEntry } from './submissionTypes';

/**
 * Per-record test result returned from `submit()`.
 */
export type SchemaValidatorRecordTestResult = {
	id: string;
} & TestResult<RecordValidationError[]>;

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
 * Pre-computed configuration for a single schema describing which fields need to be
 * captured in the snapshot for deferred validation. Computed once at construction time.
 */
type SchemaSnapshotConfig = {
	schema: Schema;
	snapshotFields: Set<string>;
	uniqueFields: string[];
	uniqueKeyFields: string[];
	childForeignKeyRules: ForeignKeyRestriction[];
};

/**
 * Internal running counters maintained per schema.
 */
type SchemaRunningCounters = {
	recordCount: number;
	recordErrorCount: number;
};

/**
 * The deferred-validation fields retained for one submitted record.
 */
type RecordSnapshot = {
	id: string;
	fields: DataRecord;
};

/**
 * Hash map bucket for a uniqueKey constraint, used during deferred validation.
 */
type UniqueKeyBucket = {
	values: DataRecord;
	ids: string[];
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
 * Internally, each submitted record is stored as a minimal snapshot containing only the
 * fields needed for deferred validation (unique, uniqueKey, and foreignKey fields). All
 * cross-record and cross-schema indices are built lazily at `report()`/`errors()` time,
 * one schema at a time, to minimize peak memory usage.
 *
 * Lifecycle: `new DictionaryValidator(dictionary)` -> `submit(schemaName, entry)` -> `report()` / `errors()`
 *
 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
 * - Returns `failure` with `DUPLICATE_ID` if `rejectDuplicates` is enabled and the same `id` is
 *   submitted twice for the same schema. Rejecting duplicates retains every submitted ID in memory.
 * - By default, duplicate IDs are accepted and each is treated as a separate submission, so a
 *   repeated record is reported as violating its own `unique` and `uniqueKey` constraints.
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
	/**
	 * Pre-computed per-schema configuration describing which fields to snapshot.
	 */
	private readonly schemaConfigs: Map<string, SchemaSnapshotConfig>;

	/**
	 * Per-schema record snapshots. Key is schema name, value is one snapshot per submitted record
	 * containing only the deferred-validation fields for that record. Schemas with no
	 * deferred-validation fields have an empty list.
	 *
	 * Snapshots are stored in submission order and are not keyed by ID, so records submitted with
	 * a repeated ID are each retained as separate entries.
	 */
	private readonly snapshots: Map<string, RecordSnapshot[]>;

	/**
	 * Keys: schema names (all schemas in the dictionary).
	 * Values: the set of record IDs already submitted for that schema, used for duplicate detection.
	 * Only allocated when the `rejectDuplicates` option is true; otherwise `undefined` and
	 * duplicate IDs are processed as separate submissions.
	 */
	private readonly seenIds: Map<string, Set<string>> | undefined;

	/**
	 * Per-schema running counters for record and error counts.
	 */
	private readonly perSchemaCounts: Map<string, SchemaRunningCounters>;

	/**
	 * Maps parent schema names to the set of child schemas that reference them via FK,
	 * along with the FK restrictions for each child. Used at report/errors time to
	 * process FK validation one parent at a time.
	 */
	private readonly parentToChildren: Map<string, { childSchema: string; restrictions: ForeignKeyRestriction[] }[]>;

	/**
	 * Set of parent schema field names referenced by FK rules, keyed by parent schema name.
	 * Used to build parentRefs at report/errors time.
	 */
	private readonly parentRefFields: Map<string, Set<string>>;

	private unknownSchemaCount: number;
	private activeGeneratorCount: number;

	constructor(dictionary: Dictionary, options?: ValidatorOptions) {
		this.seenIds = options?.rejectDuplicates === true ? new Map() : undefined;
		this.unknownSchemaCount = 0;
		this.activeGeneratorCount = 0;
		this.schemaConfigs = new Map();
		this.snapshots = new Map();
		this.perSchemaCounts = new Map();
		this.parentToChildren = new Map();
		this.parentRefFields = new Map();

		// First pass: collect which fields each parent schema needs to snapshot for FK references.
		// This must happen before building per-schema configs because a parent schema's snapshot
		// fields include the foreign fields referenced by child schemas' FK rules.
		for (const schema of dictionary.schemas) {
			const fkRestrictions = schema.restrictions?.foreignKey;
			if (!fkRestrictions || fkRestrictions.length === 0) {
				continue;
			}
			for (const restriction of fkRestrictions) {
				// Track parent → children mapping
				let children = this.parentToChildren.get(restriction.schema);
				if (!children) {
					children = [];
					this.parentToChildren.set(restriction.schema, children);
				}
				children.push({ childSchema: schema.name, restrictions: fkRestrictions });

				// Track which foreign fields this parent needs to snapshot
				let refFields = this.parentRefFields.get(restriction.schema);
				if (!refFields) {
					refFields = new Set();
					this.parentRefFields.set(restriction.schema, refFields);
				}
				for (const mapping of restriction.mappings) {
					refFields.add(mapping.foreign);
				}
			}
		}

		// Second pass: build per-schema snapshot config.
		for (const schema of dictionary.schemas) {
			const uniqueFields = schema.fields.filter((field) => field.unique === true).map((field) => field.name);
			const uniqueKeyFields = schema.restrictions?.uniqueKey ?? [];
			const childForeignKeyRules = schema.restrictions?.foreignKey ?? [];

			// FK local fields this schema needs to snapshot (for child FK checking)
			const fkLocalFields: string[] = [];
			for (const restriction of childForeignKeyRules) {
				for (const mapping of restriction.mappings) {
					fkLocalFields.push(mapping.local);
				}
			}

			// FK foreign fields this schema needs to snapshot (as a parent)
			const fkForeignFields = this.parentRefFields.get(schema.name);

			// Union of all deferred-validation fields
			const snapshotFields = new Set<string>([...uniqueFields, ...uniqueKeyFields, ...fkLocalFields]);
			if (fkForeignFields) {
				for (const field of fkForeignFields) {
					snapshotFields.add(field);
				}
			}

			this.schemaConfigs.set(schema.name, {
				schema,
				snapshotFields,
				uniqueFields,
				uniqueKeyFields,
				childForeignKeyRules,
			});
			this.snapshots.set(schema.name, []);
			this.seenIds?.set(schema.name, new Set());
			this.perSchemaCounts.set(schema.name, { recordCount: 0, recordErrorCount: 0 });
		}
	}

	/**
	 * Submit one or more records for a named schema.
	 *
	 * Each record is immediately validated against the schema's field-level and record-level
	 * rules. Only the fields needed for deferred validation (unique, uniqueKey, foreignKey)
	 * are stored; the full record is not retained.
	 *
	 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
	 *   The unknown schema submission is counted in `report()`.
	 * - Returns `failure` with `DUPLICATE_ID` if `rejectDuplicates` is enabled and any submitted ID
	 *   was already seen for this schema.
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

		const config = this.schemaConfigs.get(schemaName);
		if (!config) {
			this.unknownSchemaCount++;
			return failWith<{ error: 'UNKNOWN_SCHEMA' }>(`${schemaName} is not a known schema in this dictionary.`, {
				error: 'UNKNOWN_SCHEMA',
			});
		}

		const schemaSnapshots = this.snapshots.get(schemaName);
		assert(
			schemaSnapshots,
			`Unexpected error: invariant violation in DictionaryValidator.submit(). No snapshot map exists for schema "${schemaName}", which was expected to be populated at construction time.`,
		);

		const counters = this.perSchemaCounts.get(schemaName);
		assert(
			counters,
			`Unexpected error: invariant violation in DictionaryValidator.submit(). No running counters exist for schema "${schemaName}", which was expected to be populated at construction time.`,
		);

		const schemaSeenIds = this.seenIds?.get(schemaName);

		const entries = TypeUtils.asArray(entry);
		const results: SchemaValidatorRecordTestResult[] = [];

		for (const { id, data } of entries) {
			if (schemaSeenIds !== undefined) {
				if (schemaSeenIds.has(id)) {
					return failWith<{ error: 'DUPLICATE_ID' }>(`${id} has already been submitted for schema ${schemaName}.`, {
						error: 'DUPLICATE_ID',
					});
				}
				schemaSeenIds.add(id);
			}

			// Immediate field-level and record-level validation
			const validationResult = validateRecord(data, config.schema);
			counters.recordCount++;
			if (!validationResult.valid) {
				counters.recordErrorCount++;
			}
			results.push({ id, ...validationResult });

			// Store snapshot with only deferred-validation fields
			if (config.snapshotFields.size > 0) {
				const snapshotRecord: DataRecord = {};
				for (const fieldName of config.snapshotFields) {
					snapshotRecord[fieldName] = data[fieldName];
				}
				schemaSnapshots.push({ id, fields: snapshotRecord });
			}
		}

		return success(results);
	}

	/**
	 * Generate a report of all validation results seen so far.
	 *
	 * Cross-record (unique, uniqueKey) and cross-schema (foreignKey) violations are
	 * computed lazily from the stored snapshots. Indices are built and discarded one
	 * schema at a time to minimize peak memory usage.
	 *
	 * May be called at any time. Calling `report()` does not affect the validator's state.
	 */
	report(): TestResult<DictionaryValidatorReport> {
		let isValid = this.unknownSchemaCount === 0;
		const schemaCounts: Record<string, DictionarySchemaValidationCounts> = {};

		// Cross-record validation: unique + uniqueKey, one schema at a time
		for (const [schemaName, config] of this.schemaConfigs) {
			const counters = this.perSchemaCounts.get(schemaName);
			const recordCount = counters?.recordCount ?? 0;
			const recordErrorCount = counters?.recordErrorCount ?? 0;

			if (recordErrorCount > 0) {
				isValid = false;
			}

			const schemaSnapshots = this.snapshots.get(schemaName);
			const { unique, uniqueKey } = this.computeCrossRecordCounts(config, schemaSnapshots);

			if (unique.length > 0 || uniqueKey > 0) {
				isValid = false;
			}

			// FK violations will be filled in during the parent-by-parent pass below
			schemaCounts[schemaName] = {
				recordCount,
				recordErrorCount,
				errorCounts: { unique, uniqueKey, foreignKey: [] },
			};
		}

		// Cross-schema validation: FK, one parent at a time
		for (const [parentSchemaName, children] of this.parentToChildren) {
			const parentSnapshots = this.snapshots.get(parentSchemaName);
			const parentRefFields = this.parentRefFields.get(parentSchemaName);
			if (!parentSnapshots || !parentRefFields) {
				continue;
			}

			// Build parentRefs for this one parent
			const parentRefs = this.buildParentRefs(parentSnapshots, parentRefFields);
			const foreignSchemaReferenceData = new Map<string, SchemaDataReference>();
			foreignSchemaReferenceData.set(parentSchemaName, parentRefs);

			// Test all children against this parent
			for (const { childSchema, restrictions } of children) {
				const childSnapshots = this.snapshots.get(childSchema);
				if (!childSnapshots) {
					continue;
				}

				// Only test FK rules that reference this specific parent
				const parentRestrictions = restrictions.filter((restriction) => restriction.schema === parentSchemaName);

				const violationCounts = new Map<string, ForeignKeyViolationCount>();
				for (const { fields } of childSnapshots) {
					const result = testForeignKeyRestriction(fields, parentRestrictions, foreignSchemaReferenceData);
					if (!result.valid) {
						for (const error of result.details) {
							const mappingKey = `${error.fieldName}:${error.foreignSchema.schemaName}:${error.foreignSchema.fieldName}`;
							const existing = violationCounts.get(mappingKey);
							if (existing) {
								existing.count++;
							} else {
								violationCounts.set(mappingKey, {
									localField: error.fieldName,
									foreignSchema: error.foreignSchema.schemaName,
									foreignField: error.foreignSchema.fieldName,
									count: 1,
								});
							}
						}
					}
				}

				if (violationCounts.size > 0) {
					isValid = false;
					const childCounts = schemaCounts[childSchema];
					if (childCounts) {
						childCounts.errorCounts.foreignKey.push(...violationCounts.values());
					}
				}
			}
			// parentRefs for this parent is now eligible for GC
		}

		if (isValid) {
			return valid();
		}
		return invalid({ unknownSchemaCount: this.unknownSchemaCount, schemaCounts });
	}

	/**
	 * Generator that yields one error object per cross-record or cross-schema violation.
	 *
	 * Yields cross-record (`unique`, `uniqueKey`) violations from each schema in sequence,
	 * then cross-schema (`foreignKey`) violations parent-by-parent.
	 *
	 * Errors are not grouped by record. The same record ID may appear in multiple yielded
	 * errors (once for unique, once for uniqueKey, once for FK). There is no guarantee of
	 * ordering between unique, uniqueKey, and foreignKey violations.
	 *
	 * Locks `submit()` for the duration of iteration — `submit()` will return a `LOCKED`
	 * failure until all active generators are fully consumed or their `return()` method is called.
	 */
	*errors(): Generator<DictionaryValidatorError> {
		this.activeGeneratorCount++;
		try {
			// Cross-record errors: unique + uniqueKey, one schema at a time
			for (const [schemaName, config] of this.schemaConfigs) {
				const schemaSnapshots = this.snapshots.get(schemaName);
				if (!schemaSnapshots) {
					continue;
				}
				yield* this.generateCrossRecordErrors(config, schemaSnapshots);
			}

			// Cross-schema errors: FK, one parent at a time
			for (const [parentSchemaName, children] of this.parentToChildren) {
				const parentSnapshots = this.snapshots.get(parentSchemaName);
				const parentRefFields = this.parentRefFields.get(parentSchemaName);
				if (!parentSnapshots || !parentRefFields) {
					continue;
				}

				const parentRefs = this.buildParentRefs(parentSnapshots, parentRefFields);
				const foreignSchemaReferenceData = new Map<string, SchemaDataReference>();
				foreignSchemaReferenceData.set(parentSchemaName, parentRefs);

				for (const { childSchema, restrictions } of children) {
					const childSnapshots = this.snapshots.get(childSchema);
					if (!childSnapshots) {
						continue;
					}

					const parentRestrictions = restrictions.filter((restriction) => restriction.schema === parentSchemaName);

					for (const { id: recordId, fields } of childSnapshots) {
						const result = testForeignKeyRestriction(fields, parentRestrictions, foreignSchemaReferenceData);
						if (!result.valid) {
							for (const error of result.details) {
								yield { id: recordId, schemaName: childSchema, ...error };
							}
						}
					}
				}
			}
		} finally {
			this.activeGeneratorCount--;
		}
	}

	/**
	 * Compute cross-record violation counts for a single schema from its snapshots.
	 * Builds unique field and uniqueKey indices, evaluates, and discards.
	 */
	private computeCrossRecordCounts(
		config: SchemaSnapshotConfig,
		schemaSnapshots: RecordSnapshot[] | undefined,
	): { unique: UniqueFieldViolationCount[]; uniqueKey: number } {
		if (!schemaSnapshots || schemaSnapshots.length === 0) {
			return { unique: [], uniqueKey: 0 };
		}

		// Unique field violations
		const uniqueFieldCounts: UniqueFieldViolationCount[] = [];
		for (const fieldName of config.uniqueFields) {
			const valueIndex = new Map<DataRecordValue, number>();
			for (const { fields } of schemaSnapshots) {
				const value = fields[fieldName];
				if (value === undefined || (Array.isArray(value) && value.length === 0)) {
					continue;
				}
				valueIndex.set(value, (valueIndex.get(value) ?? 0) + 1);
			}
			let count = 0;
			for (const occurrences of valueIndex.values()) {
				if (occurrences > 1) {
					count += occurrences;
				}
			}
			if (count > 0) {
				uniqueFieldCounts.push({ fieldName, count });
			}
		}

		// UniqueKey violations
		let uniqueKeyCount = 0;
		if (config.uniqueKeyFields.length > 0) {
			const keyIndex = new Map<string, number>();
			for (const { fields } of schemaSnapshots) {
				const keyValues = getUniqueKeyValues(fields, config.uniqueKeyFields);
				const hash = hashDataRecord(keyValues);
				keyIndex.set(hash, (keyIndex.get(hash) ?? 0) + 1);
			}
			for (const occurrences of keyIndex.values()) {
				if (occurrences > 1) {
					uniqueKeyCount += occurrences;
				}
			}
		}

		return { unique: uniqueFieldCounts, uniqueKey: uniqueKeyCount };
	}

	/**
	 * Generator that yields cross-record errors (unique + uniqueKey) for a single schema.
	 * Builds indices from snapshots, yields violations, then discards indices.
	 */
	private *generateCrossRecordErrors(
		config: SchemaSnapshotConfig,
		schemaSnapshots: RecordSnapshot[],
	): Generator<CrossRecordValidationError> {
		if (schemaSnapshots.length === 0) {
			return;
		}

		// Unique field errors
		for (const fieldName of config.uniqueFields) {
			const valueIndex = new Map<DataRecordValue, string[]>();
			for (const { id: recordId, fields } of schemaSnapshots) {
				const value = fields[fieldName];
				if (value === undefined || (Array.isArray(value) && value.length === 0)) {
					continue;
				}
				const existing = valueIndex.get(value);
				if (existing) {
					existing.push(recordId);
				} else {
					valueIndex.set(value, [recordId]);
				}
			}
			for (const [value, ids] of valueIndex) {
				if (ids.length > 1) {
					for (const _id of ids) {
						yield {
							reason: 'INVALID_BY_UNIQUE' as const,
							fieldName,
							fieldValue: value,
							matchingRecords: ids,
						};
					}
				}
			}
		}

		// UniqueKey errors
		if (config.uniqueKeyFields.length > 0) {
			const keyIndex = new Map<string, UniqueKeyBucket>();
			for (const { id: recordId, fields } of schemaSnapshots) {
				const keyValues = getUniqueKeyValues(fields, config.uniqueKeyFields);
				const hash = hashDataRecord(keyValues);
				const existing = keyIndex.get(hash);
				if (existing) {
					existing.ids.push(recordId);
				} else {
					keyIndex.set(hash, { values: keyValues, ids: [recordId] });
				}
			}
			for (const { values, ids } of keyIndex.values()) {
				if (ids.length > 1) {
					for (const _id of ids) {
						yield {
							reason: 'INVALID_BY_UNIQUE_KEY' as const,
							matchingRecords: ids,
							uniqueKey: values,
						};
					}
				}
			}
		}
	}

	/**
	 * Build a SchemaDataReference (field → Set<value>) from a single parent schema's
	 * snapshots. Only the fields named in `refFields` are collected.
	 */
	private buildParentRefs(parentSnapshots: RecordSnapshot[], refFields: Set<string>): SchemaDataReference {
		const parentRefs: SchemaDataReference = new Map();
		for (const fieldName of refFields) {
			parentRefs.set(fieldName, new Set());
		}
		for (const { fields } of parentSnapshots) {
			for (const [fieldName, valueSet] of parentRefs) {
				const value = fields[fieldName];
				if (value !== undefined) {
					valueSet.add(value);
				}
			}
		}
		return parentRefs;
	}
}

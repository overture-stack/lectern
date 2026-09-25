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
	type Dictionary,
	type ForeignKeyRestriction,
	type Result,
} from '@overture-stack/lectern-dictionary';
import { invalid, valid, type TestResult } from '../types';
import { assert } from '../utils/assert';
import type { SchemaDataReference } from '../validateDictionary/collectSchemaReferenceData';
import type { DictionaryValidationErrorRecordForeignKey } from '../validateDictionary/DictionaryValidationError';
import { testForeignKeyRestriction } from '../validateDictionary/testForeignKeyRestriction';
import type { ValidatorRecordEntry } from './submissionTypes';

/**
 * Count of records violating a specific foreignKey mapping.
 */
export type ForeignKeyViolationCount = {
	localField: string;
	foreignSchema: string;
	foreignField: string;
	count: number;
};

/**
 * Aggregated foreignKey violation counts for a single child schema.
 */
export type CrossSchemaViolationCounts = {
	schemaName: string;
	counts: ForeignKeyViolationCount[];
};

/**
 * Report details returned by CrossSchemaValidator when violations are found.
 */
export type CrossSchemaReport = {
	/**
	 * Per-child-schema counts of records involved in foreignKey violations.
	 * Contains one entry per child schema that has at least one violation.
	 */
	foreignKey: CrossSchemaViolationCounts[];
};

/**
 * A single foreignKey violation error yielded by the `errors()` generator.
 * Extends `DictionaryValidationErrorRecordForeignKey` with the submitting record's
 * ID and the name of the child schema.
 */
export type CrossSchemaValidationError = {
	id: string;
	schemaName: string;
} & DictionaryValidationErrorRecordForeignKey;

/**
 * Minimal per-record snapshot stored for child schema records.
 * Only the local FK field values are retained; the full record is discarded.
 */
type ChildSnapshot = {
	id: string;
	fkFields: DataRecord;
};

/**
 * CrossSchemaValidator validates foreignKey constraints that span multiple schemas.
 *
 * It is stateful and accepts records one schema at a time. For parent schemas (those
 * referenced by foreignKey rules), it accumulates a set of seen field values. For child
 * schemas (those with foreignKey restrictions), it stores only the relevant local field
 * values. FK violations are evaluated lazily at `report()` or `errors()` time against
 * the then-complete parent reference sets.
 *
 * This design means FK correctness is only guaranteed once all parent records have been
 * submitted. Calling `report()` mid-stream will produce results that reflect only the
 * parent values seen so far.
 *
 * Lifecycle: `new CrossSchemaValidator(dictionary)` -> `submit(schemaName, entry)` -> `report()` / `errors()`
 *
 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
 * - Returns `failure` with `DUPLICATE_ID` if the same `id` is submitted twice for the same schema.
 * - Returns `failure` with `LOCKED` while the `errors()` generator is active.
 * - ID uniqueness is per-schema: the same `id` may be submitted to different schemas.
 */
export class CrossSchemaValidator {
	private readonly knownSchemaNames: Set<string>;

	/**
	 * Keys: child schema names (schemas that declare at least one FK restriction).
	 * Values: the FK restriction rules for that schema, evaluated at report()/errors() time.
	 */
	private readonly childForeignKeyRules: Map<string, ForeignKeyRestriction[]>;

	/**
	 * Keys: parent schema names (schemas referenced by at least one FK rule).
	 * Values: a SchemaDataReference (fieldName -> Set<value>) holding all observed values
	 * for each referenced foreign field, accumulated as parent records are submitted.
	 * Initialized at construction time with an entry for every foreign field that any FK
	 * rule references, so submission only needs to add values — never to create new entries.
	 */
	private readonly parentRefs: Map<string, SchemaDataReference>;

	/**
	 * Keys: child schema names.
	 * Values: minimal field snapshots of submitted child records, containing only the
	 * local FK field values needed for constraint checking at report()/errors() time.
	 */
	private readonly childSnapshots: Map<string, ChildSnapshot[]>;

	/**
	 * Keys: schema names (all schemas in the dictionary).
	 * Values: the set of record IDs already submitted for that schema, used for duplicate detection.
	 */
	private readonly seenIds: Map<string, Set<string>>;

	private activeGeneratorCount: number;

	constructor(dictionary: Dictionary) {
		this.activeGeneratorCount = 0;
		this.knownSchemaNames = new Set(dictionary.schemas.map((schema) => schema.name));
		this.childForeignKeyRules = new Map();
		this.parentRefs = new Map();
		this.childSnapshots = new Map();
		this.seenIds = new Map();

		for (const schema of dictionary.schemas) {
			this.seenIds.set(schema.name, new Set());
		}

		for (const schema of dictionary.schemas) {
			const fkRestrictions = schema.restrictions?.foreignKey;
			if (!fkRestrictions || fkRestrictions.length === 0) {
				continue;
			}

			this.childForeignKeyRules.set(schema.name, fkRestrictions);
			this.childSnapshots.set(schema.name, []);

			for (const restriction of fkRestrictions) {
				let parentFieldValues = this.parentRefs.get(restriction.schema);
				if (!parentFieldValues) {
					parentFieldValues = new Map();
					this.parentRefs.set(restriction.schema, parentFieldValues);
				}
				for (const mapping of restriction.mappings) {
					if (!parentFieldValues.has(mapping.foreign)) {
						parentFieldValues.set(mapping.foreign, new Set());
					}
				}
			}
		}
	}

	private processEntry(
		schemaName: string,
		id: string,
		data: DataRecord,
	): Result<void, { error: 'UNKNOWN_SCHEMA' | 'DUPLICATE_ID' | 'LOCKED' }> {
		if (this.activeGeneratorCount > 0) {
			return failWith<{ error: 'LOCKED' }>(`Cannot submit records while the errors() generator is running.`, {
				error: 'LOCKED',
			});
		}

		if (!this.knownSchemaNames.has(schemaName)) {
			return failWith<{ error: 'UNKNOWN_SCHEMA' }>(`${schemaName} is not a known schema in this dictionary.`, {
				error: 'UNKNOWN_SCHEMA',
			});
		}

		// Reject duplicate IDs — each record must be submitted exactly once per schema.
		const schemaSeenIds = this.seenIds.get(schemaName);
		assert(
			schemaSeenIds,
			`Unexpected error: invariant violation in CrossSchemaValidator.processEntry(). No set of seen-IDs exists for schema "${schemaName}", which was expected to be populated at construction time.`,
		);

		if (schemaSeenIds.has(id)) {
			return failWith<{ error: 'DUPLICATE_ID' }>(`${id} has already been submitted for schema ${schemaName}.`, {
				error: 'DUPLICATE_ID',
			});
		}
		schemaSeenIds.add(id);

		// If this schema is referenced as a parent by any FK rule, accumulate its field values
		// into parentRefs so child records can look them up during report()/errors().
		// Schemas that are not FK parents have no entry in parentRefs and are skipped.
		const parentFieldValues = this.parentRefs.get(schemaName);
		if (parentFieldValues) {
			for (const [fieldName, valueSet] of parentFieldValues) {
				const value = data[fieldName];
				if (value !== undefined) {
					valueSet.add(value);
				}
			}
		}

		// If this schema declares FK restrictions, store a snapshot of the local FK field values
		// for this record. The snapshot is used at report()/errors() time to check each record's
		// FK references against the then-complete parentRefs.
		// Schemas with no FK restrictions have no entry in childSnapshots and are skipped.
		const childSnapshots = this.childSnapshots.get(schemaName);
		if (childSnapshots) {
			const fkRestrictions = this.childForeignKeyRules.get(schemaName);
			assert(
				fkRestrictions,
				`Unexpected error: invariant violation in CrossSchemaValidator.processEntry(). No FK restriction rules found for schema "${schemaName}", which was expected to be populated at construction time alongside child snapshots.`,
			);
			const fkFields: DataRecord = {};
			for (const restriction of fkRestrictions) {
				for (const mapping of restriction.mappings) {
					fkFields[mapping.local] = data[mapping.local];
				}
			}
			childSnapshots.push({ id, fkFields });
		}

		return success(undefined);
	}

	/**
	 * Submit one or more records for a named schema.
	 *
	 * For parent schemas, the relevant foreign field values are added to the internal
	 * reference set. For child schemas, only the local FK field values are stored.
	 *
	 * - Returns `failure` with `UNKNOWN_SCHEMA` if `schemaName` is not in the dictionary.
	 * - Returns `failure` with `DUPLICATE_ID` if any submitted `id` was already seen for this schema.
	 * - Returns `failure` with `LOCKED` if the `errors()` generator is currently active.
	 * - In batch submission, if any entry fails the call immediately returns the failure and
	 *   no further entries in that batch are processed.
	 */
	submit(
		schemaName: string,
		entry: ValidatorRecordEntry | ValidatorRecordEntry[],
	): Result<void, { error: 'UNKNOWN_SCHEMA' | 'DUPLICATE_ID' | 'LOCKED' }> {
		const entries = TypeUtils.asArray(entry);
		for (const { id, data } of entries) {
			const result = this.processEntry(schemaName, id, data);
			if (!result.success) {
				return result;
			}
		}
		return success(undefined);
	}

	/**
	 * Generate a report of all foreignKey violations detected across submitted child records.
	 *
	 * FK violations are evaluated at call time against the current parent reference sets.
	 * Results are only meaningful once all parent records have been submitted.
	 *
	 * - Returns `valid()` when no FK violations are detected.
	 * - Returns `invalid({ foreignKey })` with per-child-schema violation counts otherwise.
	 *
	 * May be called at any time. Calling `report()` does not affect the validator's state.
	 */
	report(): TestResult<CrossSchemaReport> {
		const foreignKeyGroupedCounts = new Map<string, Map<string, ForeignKeyViolationCount>>();

		for (const [schemaName, snapshots] of this.childSnapshots) {
			const fkRestrictions = this.childForeignKeyRules.get(schemaName);
			if (!fkRestrictions) {
				continue;
			}

			for (const { fkFields } of snapshots) {
				const result = testForeignKeyRestriction(fkFields, fkRestrictions, this.parentRefs);
				if (!result.valid) {
					for (const error of result.details) {
						const mappingKey = `${error.fieldName}:${error.foreignSchema.schemaName}:${error.foreignSchema.fieldName}`;

						let schemaViolations = foreignKeyGroupedCounts.get(schemaName);
						if (!schemaViolations) {
							schemaViolations = new Map();
							foreignKeyGroupedCounts.set(schemaName, schemaViolations);
						}

						const existing = schemaViolations.get(mappingKey);
						if (existing) {
							existing.count++;
						} else {
							schemaViolations.set(mappingKey, {
								localField: error.fieldName,
								foreignSchema: error.foreignSchema.schemaName,
								foreignField: error.foreignSchema.fieldName,
								count: 1,
							});
						}
					}
				}
			}
		}

		if (foreignKeyGroupedCounts.size === 0) {
			return valid();
		}

		const foreignKey: CrossSchemaViolationCounts[] = [...foreignKeyGroupedCounts.entries()].map(
			([schemaName, violationMap]) => ({
				schemaName,
				counts: [...violationMap.values()],
			}),
		);

		return invalid({ foreignKey });
	}

	/**
	 * Generator that yields one error object per foreignKey violation across all submitted
	 * child records.
	 *
	 * Locks `submit()` for the duration of iteration — `submit()` will return a `LOCKED`
	 * failure until all active generators are fully consumed or their `return()` method is called.
	 */
	*errors(): Generator<CrossSchemaValidationError> {
		this.activeGeneratorCount++;
		try {
			for (const [schemaName, snapshots] of this.childSnapshots) {
				const fkRestrictions = this.childForeignKeyRules.get(schemaName);
				if (!fkRestrictions) {
					continue;
				}
				for (const { id, fkFields } of snapshots) {
					const result = testForeignKeyRestriction(fkFields, fkRestrictions, this.parentRefs);
					if (!result.valid) {
						for (const error of result.details) {
							yield { id, schemaName, ...error };
						}
					}
				}
			}
		} finally {
			this.activeGeneratorCount--;
		}
	}
}

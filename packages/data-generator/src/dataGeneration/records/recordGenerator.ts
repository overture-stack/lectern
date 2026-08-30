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

import * as fc from 'fast-check';
import type { DataRecord, DataRecordValue, Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import {
	generateBooleanValue,
	generateIntegerValue,
	generateNumberValue,
	generateStringValue,
} from './fieldGenerators';
import { resolveGenerationOrder } from './fieldDependencies';

/**
 * Supplies the set of valid parent rows for each FK relationship when generating child records.
 *
 * The map is keyed by the **parent schema name** (matching `ForeignKeyRestriction.schema`).
 * Each value is an array of partial `DataRecord` objects — one entry per available parent row.
 *
 * Each partial record need only contain the fields named in the FK mappings' `foreign` side for
 * the relevant FK rule. It does not need to be a complete record from the parent schema; any fields
 * not referenced by FK mappings on this child schema are ignored.
 *
 * Example: if the child schema has a FK to `"donor"` with mapping `{ local: "donor_id", foreign: "id" }`,
 * the pool entry for `"donor"` must include at least `{ id: someValue }` for each available parent row.
 *
 * For composite FK rules (multiple mappings in a single `ForeignKeyRestriction`), all mapped local
 * fields are assigned from the **same** selected parent row, preserving relational consistency.
 *
 * When a parent schema name has no entry in this map, FK fields referencing that schema are
 * generated normally — field-level restrictions apply and no FK constraint is enforced.
 */
export type ForeignKeyPool = Map<string, DataRecord[]>;

/**
 * Options for `generateRecord`.
 *
 * `overrides` provides values for specific fields by name; those fields are not generated.
 * `seed` controls the RNG so that the same schema and seed always produce the same record.
 * `foreignKeyPool` supplies available parent rows for FK-constrained fields.
 */
export type RecordGeneratorOptions = {
	overrides?: DataRecord;
	seed?: number;
	foreignKeyPool?: ForeignKeyPool;
};

/**
 * Resolves FK-derived field values from `foreignKeyPool` for all FK rules on `schema`.
 *
 * For each `ForeignKeyRestriction`, a single parent row is selected at random from the pool.
 * All local fields in that rule's mappings are assigned from that same row, preserving composite
 * FK consistency. FK row selection uses seeds offset beyond the per-field seed range
 * (`seed + schema.fields.length + fkIndex`) so they never collide with field generation seeds.
 *
 * Returns a partial `DataRecord` containing only the FK-derived field values. Fields whose parent
 * schema has no pool entry are omitted — they will be generated normally.
 */
const resolveForeignKeyOverrides = (schema: Schema, pool: ForeignKeyPool, seed: number | undefined): DataRecord => {
	const fkOverrides: DataRecord = {};
	const foreignKeyRules = schema.restrictions?.foreignKey ?? [];

	foreignKeyRules.forEach((fkRestriction, fkIndex) => {
		const parentRows = pool.get(fkRestriction.schema);
		if (parentRows === undefined || parentRows.length === 0) {
			return;
		}

		const rowSeed = seed !== undefined ? seed + schema.fields.length + fkIndex + 1 : undefined;
		const rowIndex =
			rowSeed !== undefined ?
				(fc.sample(fc.integer({ min: 0, max: parentRows.length - 1 }), { seed: rowSeed, numRuns: 1 })[0] ?? 0)
			:	Math.floor(Math.random() * parentRows.length);

		const selectedRow = parentRows[rowIndex] ?? parentRows[0];
		if (selectedRow === undefined) {
			return;
		}

		for (const mapping of fkRestriction.mappings) {
			if (Object.hasOwn(selectedRow, mapping.foreign)) {
				fkOverrides[mapping.local] = selectedRow[mapping.foreign];
			}
		}
	});

	return fkOverrides;
};

/**
 * Generates a `DataRecord` with values for every field in `schema`. Each field's value is produced
 * by the appropriate field generator for its `valueType`, respecting all active restrictions.
 *
 * If `options.seed` is provided, the RNG is seeded before generation so the same schema and seed
 * always produce the same record. Per-field seeds are derived by offsetting the record seed by the
 * field's definition-order index in `schema.fields`, ensuring stability even when generation order
 * differs from definition order.
 *
 * If `options.overrides` is provided, fields with an override value use that value directly and are
 * not generated. Explicit overrides take priority over `foreignKeyPool` values.
 *
 * If `options.foreignKeyPool` is provided, fields governed by a FK restriction on the schema are
 * assigned values from a randomly selected parent row rather than generated freely. All local fields
 * within a single FK rule are drawn from the same parent row to preserve composite FK consistency.
 * See `ForeignKeyPool` for the expected pool structure.
 *
 * Fields are generated in dependency order: a field whose conditional restrictions reference other
 * fields is always generated after those fields, so the partial record passed into later generators
 * reflects the correct values when evaluating conditional branches.
 */
export const generateRecord = (schema: Schema, options?: RecordGeneratorOptions): DataRecord => {
	const { seed, overrides = {}, foreignKeyPool } = options ?? {};
	const record: DataRecord = {};

	const fkOverrides = foreignKeyPool !== undefined ? resolveForeignKeyOverrides(schema, foreignKeyPool, seed) : {};
	const effectiveOverrides: DataRecord = { ...fkOverrides, ...overrides };

	const fieldByName = new Map<string, SchemaField>(schema.fields.map((field) => [field.name, field]));
	const fieldIndexByName = new Map<string, number>(schema.fields.map((field, fieldIndex) => [field.name, fieldIndex]));

	const generationOrder = resolveGenerationOrder(schema);

	for (const tier of generationOrder) {
		for (const fieldName of tier) {
			if (Object.hasOwn(effectiveOverrides, fieldName)) {
				record[fieldName] = effectiveOverrides[fieldName];
				continue;
			}

			const field = fieldByName.get(fieldName);
			if (field === undefined) {
				continue;
			}

			const definitionIndex = fieldIndexByName.get(fieldName) ?? 0;
			const fieldSeed = seed !== undefined ? seed + definitionIndex + 1 : undefined;
			const fieldOptions = { seed: fieldSeed, record };

			let result;
			switch (field.valueType) {
				case 'boolean':
					result = generateBooleanValue(field, fieldOptions);
					break;
				case 'integer':
					result = generateIntegerValue(field, fieldOptions);
					break;
				case 'number':
					result = generateNumberValue(field, fieldOptions);
					break;
				case 'string':
					result = generateStringValue(field, fieldOptions);
					break;
			}

			const value: DataRecordValue = result.success ? result.data : result.data.value;
			record[fieldName] = value;
		}
	}

	return record;
};

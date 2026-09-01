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

import type { DataRecord, Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { type ForeignKeyPool } from '../records/recordGenerator';
import { generateSchemaRecords } from '../records/schemaGenerator';

/** Maps schema name to the number of records to generate. Schemas absent from this map or with count 0 are skipped. */
export type DictionarySchemaCount = Record<string, number>;

/** Options for `generateDictionaryRecords`. */
export type DictionaryGeneratorOptions = {
	counts: DictionarySchemaCount;
	seed?: number;
	emptyRate?: number;
};

/** A single record yielded by `generateDictionaryRecords`, tagged with its originating schema name. */
export type DictionaryRecord = {
	schemaName: string;
	record: DataRecord;
};

// Builds a tier-ordered list of schema names using Kahn's algorithm on FK edges.
// Child schemas depend on parent schemas (FK target must be generated first).
// Schemas not in `includedNames` are excluded from the graph entirely.
const resolveSchemaGenerationOrder = (schemas: Schema[], includedNames: Set<string>): string[][] => {
	const included = schemas.filter((schema) => includedNames.has(schema.name));

	const inDegree = new Map<string, number>(included.map((schema) => [schema.name, 0]));
	// dependents[parent] = set of child schema names that depend on parent
	const dependents = new Map<string, Set<string>>(included.map((schema) => [schema.name, new Set()]));

	for (const schema of included) {
		for (const fkRule of schema.restrictions?.foreignKey ?? []) {
			if (!includedNames.has(fkRule.schema)) {
				continue;
			}
			inDegree.set(schema.name, (inDegree.get(schema.name) ?? 0) + 1);
			dependents.get(fkRule.schema)?.add(schema.name);
		}
	}

	const readyQueue = included.map((schema) => schema.name).filter((name) => (inDegree.get(name) ?? 0) === 0);
	const processed = new Set<string>();
	const order: string[][] = [];

	while (processed.size < included.length) {
		if (readyQueue.length === 0) {
			// Cycle among remaining schemas — place all remaining in one tier.
			const cyclic = included.map((schema) => schema.name).filter((name) => !processed.has(name));
			order.push(cyclic);
			break;
		}

		const currentTier = readyQueue.splice(0);
		order.push(currentTier);

		for (const schemaName of currentTier) {
			processed.add(schemaName);
			for (const dependent of dependents.get(schemaName) ?? new Set()) {
				const newDegree = (inDegree.get(dependent) ?? 1) - 1;
				inDegree.set(dependent, newDegree);
				if (newDegree === 0) {
					readyQueue.push(dependent);
				}
			}
		}
	}

	return order;
};

// Projects each record down to only the foreign fields referenced by child schemas pointing at `parentSchemaName`.
const extractFkPool = (parentSchemaName: string, records: DataRecord[], childSchemas: Schema[]): DataRecord[] => {
	const foreignFieldNames = new Set<string>();
	for (const childSchema of childSchemas) {
		for (const fkRule of childSchema.restrictions?.foreignKey ?? []) {
			if (fkRule.schema === parentSchemaName) {
				for (const mapping of fkRule.mappings) {
					foreignFieldNames.add(mapping.foreign);
				}
			}
		}
	}

	return records.map((record) => {
		const projected: DataRecord = {};
		for (const fieldName of foreignFieldNames) {
			if (Object.hasOwn(record, fieldName)) {
				projected[fieldName] = record[fieldName];
			}
			// If the field is absent from the record (e.g. generated as undefined and not set),
			// it is omitted from the pool entry. Child records that draw from this pool will find
			// no value for that mapping and fall back to unconstrained generation for that field.
		}
		return projected;
	});
};

/**
 * Lazily generates records for all schemas in `dictionary` that have a non-zero count in
 * `options.counts`, yielding one `DictionaryRecord` at a time.
 *
 * Schemas are generated in FK dependency order. Parent schemas are fully generated and held in
 * memory as a FK pool before any child records are yielded, ensuring child FK fields always
 * reference valid parent values. Child records are streamed out one at a time and not retained.
 */
export function* generateDictionaryRecords(
	dictionary: Dictionary,
	options: DictionaryGeneratorOptions,
): Generator<DictionaryRecord> {
	const { counts, seed, emptyRate } = options;

	const includedNames = new Set(
		Object.entries(counts)
			.filter(([, count]) => count > 0)
			.map(([name]) => name),
	);

	const schemaByName = new Map<string, Schema>(dictionary.schemas.map((schema) => [schema.name, schema]));
	const generationOrder = resolveSchemaGenerationOrder(dictionary.schemas, includedNames);

	// Assign a stable index to each schema in generation order for deterministic per-schema seeds.
	const schemaGenerationIndex = new Map<string, number>();
	let generationIndex = 0;
	for (const tier of generationOrder) {
		for (const schemaName of tier) {
			schemaGenerationIndex.set(schemaName, generationIndex++);
		}
	}

	const foreignKeyPool: ForeignKeyPool = new Map();

	// Pre-compute which included schemas have at least one included child schema depending on them.
	// Only schemas with included dependents need their records collected into the FK pool.
	const schemasWithDependents = new Set<string>();
	for (const schema of dictionary.schemas) {
		if (!includedNames.has(schema.name)) {
			continue;
		}
		for (const fkRule of schema.restrictions?.foreignKey ?? []) {
			if (includedNames.has(fkRule.schema)) {
				schemasWithDependents.add(fkRule.schema);
			}
		}
	}

	for (const tier of generationOrder) {
		for (const schemaName of tier) {
			const schema = schemaByName.get(schemaName);
			if (schema === undefined) {
				continue;
			}

			const count = counts[schemaName] ?? 0;
			const schemaIndex = schemaGenerationIndex.get(schemaName) ?? 0;
			const schemaSeed = seed !== undefined ? seed + schemaIndex : undefined;
			const schemaGenerator = generateSchemaRecords(schema, { count, seed: schemaSeed, foreignKeyPool, emptyRate });

			if (schemasWithDependents.has(schemaName)) {
				// Collect fully into the FK pool before yielding, so child schemas can reference these records.
				const records = [...schemaGenerator];
				const poolEntry = extractFkPool(schemaName, records, dictionary.schemas);
				foreignKeyPool.set(schemaName, poolEntry);
				for (const record of records) {
					yield { schemaName, record };
				}
			} else {
				// No children depend on this schema — stream records out directly without collecting.
				for (const record of schemaGenerator) {
					yield { schemaName, record };
				}
			}
		}
	}
}

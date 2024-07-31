/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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
	type DataRecord,
	type DataRecordValue,
	type Dictionary,
	type ForeignKeyRestriction,
	type Schema,
} from 'dictionary';

/**
 * This type alias is for a structure used to collect then lookup values from schemas. It is helpful
 * to check if a value exists in a schema's records. Each set is a collection of all values from the
 * data set for a field from the schema.
 */
export type SchemaDataReference = Map<string, Set<DataRecordValue>>;

/**
 * Collect all the values for each field from a list of records into a Set. Return those sets
 * in a Map with the field name as the key
 *
 * undefined values will be skipped.
 */
const collectFieldValues = (records: DataRecord[], fieldNames: Set<string> | string[]): SchemaDataReference =>
	records.reduce<SchemaDataReference>((schemaDataReference, record) => {
		fieldNames.forEach((fieldName) => {
			let set = schemaDataReference.get(fieldName);
			if (!set) {
				// Ensure each has a set created. This will happen exactly once.
				set = new Set();
				schemaDataReference.set(fieldName, set);
			}

			const value = record[fieldName];
			if (value !== undefined) {
				set.add(value);

				// Only update the set in the data reference if we have added a value.
				schemaDataReference.set(fieldName, set);
			}
		});

		return schemaDataReference;
	}, new Map());

/**
 * Create the reference data needed to efficiently check foreign key restrictions.
 *
 * For every field that is referenced by a foreign key restriction, this creates a set of all values for that
 * field from the records provided for that schema. This will be used when testing foreign key restrictions as
 * as quick way to look up if the local field's value is present in the foreign schema's field (since lookups
 * in a Set are much quicker than iterating through all items in an array). Additionally, this reference allows
 * us to perform the foreign key test without providing all record data to the test, instead passing only this
 * reference data.
 *
 * The output of this function is a Map of schema names to a Map of Field names, to a Set of field values.
 * It may be convenient to think of the output like this:
 *
 * ```
 * {
 * 	"schemaA": {
 * 		"fieldName1": [... set of all values ...],
 * 		"fieldName2": [... set of all values ...]
 * 	}
 * 	"schemaB": {
 * 		"fieldName3": [... set of all values ...]
 * 	}
 * }
 * ```
 * @param data Record that maps schema names to the list of records to be validated for that schema
 * @param dictionary
 * @returns
 */
export const collectSchemaReferenceData = (
	data: Record<string, DataRecord[]>,
	dictionary: Dictionary,
): Map<string, SchemaDataReference> => {
	const schemasWithForeignKeyRestrictions: Array<{
		schema: Schema;
		foreignKeyRestriction: ForeignKeyRestriction[];
	}> = dictionary.schemas
		.map((schema) =>
			schema.restrictions?.foreignKey ? { schema, foreignKeyRestriction: schema.restrictions?.foreignKey } : undefined,
		)
		.filter(TypeUtils.isDefined);

	const foreignKeyMappings = schemasWithForeignKeyRestrictions.flatMap(
		({ foreignKeyRestriction: foreignKeyMappings }) => foreignKeyMappings,
	);

	// Map of schema names to Set of field names
	const foreignSchemaFieldNamesMap = foreignKeyMappings.reduce<Map<string, Set<string>>>(
		(schemaMap, foreignKeyMapping) => {
			let fieldSet = schemaMap.get(foreignKeyMapping.schema);
			if (!fieldSet) {
				fieldSet = new Set();
				schemaMap.set(foreignKeyMapping.schema, fieldSet);
			}

			const fieldNames = foreignKeyMapping.mappings.map((mapping) => mapping.foreign);
			fieldNames.forEach((fieldName) => fieldSet.add(fieldName));

			return schemaMap;
		},
		new Map(),
	);

	// Map of schema names to SchemaDataReference objects containing all the unique values for the fields that are needed for foreign key restrictions
	const foreignSchemaDataReferenceMap = new Map<string, SchemaDataReference>();
	for (const [schemaName, fieldSet] of foreignSchemaFieldNamesMap.entries()) {
		const records = data[schemaName] || [];
		const referenceMap = collectFieldValues(records, fieldSet);
		foreignSchemaDataReferenceMap.set(schemaName, referenceMap);
	}

	return foreignSchemaDataReferenceMap;
};

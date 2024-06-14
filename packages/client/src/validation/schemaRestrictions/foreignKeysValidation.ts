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

import { differenceWith, isEqual } from 'lodash';
import { DataRecord } from '../../types/dataRecords';
import { ForeignKeyValidationError, SchemaValidationErrorTypes } from '../types/validationErrorTypes';
import { CrossSchemaValidationFunction } from '../types/validationFunctionTypes';
import { selectFieldsFromDataset } from '../utils/datasetUtils';

/**
 * Validate all foreign key restrictions in a Schema
 * @param schema
 * @param data
 * @returns
 */
export const validateForeignKeys: CrossSchemaValidationFunction = (schema, data): ForeignKeyValidationError[] => {
	const errors: Array<ForeignKeyValidationError> = [];
	const foreignKeyDefinitions = schema?.restrictions?.foreignKey;
	if (foreignKeyDefinitions) {
		foreignKeyDefinitions.forEach((foreignKeyDefinition) => {
			const localSchemaData = data[schema.name] || [];
			const foreignSchemaData = data[foreignKeyDefinition.schema] || [];

			// A foreign key can have more than one field, in which case is a composite foreign key.
			const localFields = foreignKeyDefinition.mappings.map((x) => x.local);
			const foreignFields = foreignKeyDefinition.mappings.map((x) => x.foreign);

			const fieldsMappings = new Map<string, string>(foreignKeyDefinition.mappings.map((x) => [x.foreign, x.local]));

			// Select the keys of the datasets to compare. The keys are records to support the scenario where the fk is composite.
			const localValues: [number, DataRecord][] = selectFieldsFromDataset(localSchemaData, localFields);
			const foreignValues: [number, DataRecord][] = selectFieldsFromDataset(foreignSchemaData, foreignFields);

			// This artificial record in foreignValues allows null references in localValues to be valid.
			const emptyRow: Record<string, string | string[]> = {};
			foreignFields.forEach((field) => (emptyRow[field] = ''));
			foreignValues.push([-1, emptyRow]);

			const missingForeignKeys = findMissingForeignKeys(localValues, foreignValues, fieldsMappings);

			missingForeignKeys.forEach((record) => {
				const index = record[0];
				const info: ForeignKeyValidationError['info'] = {
					value: record[1],
					foreignSchema: foreignKeyDefinition.schema,
				};
				const errorFieldName = localFields.join(', ');
				errors.push({
					errorType: SchemaValidationErrorTypes.INVALID_BY_FOREIGN_KEY,
					fieldName: errorFieldName,
					index,
					info,
					message: getForeignKeyErrorMessage({
						fieldName: errorFieldName,
						foreignSchema: foreignKeyDefinition.schema,
						value: record[1],
					}),
				});
			});
		});
	}
	return errors;
};

function getForeignKeyErrorMessage(errorData: { value: DataRecord; foreignSchema: string; fieldName: string }) {
	const valueEntries = Object.entries(errorData.value);
	const formattedKeyValues: string[] = valueEntries.map(([key, value]) => {
		if (Array.isArray(value)) {
			return `${key}: [${value.join(', ')}]`;
		} else {
			return `${key}: ${value}`;
		}
	});
	const valuesAsString = formattedKeyValues.join(', ');
	const detail = `Key ${valuesAsString} is not present in schema ${errorData.foreignSchema}`;
	const msg = `Record violates foreign key restriction defined for field(s) ${errorData.fieldName}. ${detail}.`;
	return msg;
}

/**
 * Find missing foreign keys by calculating the difference between 2 dataset keys (similar to a set difference).
 * Returns rows in `dataKeysA` which are not present in `dataKeysB`.
 * @param datasetKeysA Keys of the dataset A. The returned value of this function is a subset of this array.
 * @param datasetKeysB Keys of the dataset B. Elements to be substracted from `datasetKeysA`.
 * @param fieldsMapping Mapping of the field names so the keys can be compared correctly.
 */
const findMissingForeignKeys = (
	datasetKeysA: [number, DataRecord][],
	datasetKeysB: [number, DataRecord][],
	fieldsMapping: Map<string, string>,
): [number, DataRecord][] => {
	const diff = differenceWith(datasetKeysA, datasetKeysB, (a, b) =>
		isEqual(a[1], renameProperties(b[1], fieldsMapping)),
	);
	return diff;
};

/**
 * Renames properties in a record using a mapping between current and new names.
 * @param record The record whose properties should be renamed.
 * @param fieldsMapping A mapping of current property names to new property names.
 * @returns A new record with the properties' names changed according to the mapping.
 */
const renameProperties = (record: DataRecord, fieldsMapping: Map<string, string>): DataRecord => {
	const renamed: DataRecord = {};
	Object.entries(record).forEach(([propertyName, propertyValue]) => {
		const newName = fieldsMapping.get(propertyName) ?? propertyName;
		renamed[newName] = propertyValue;
	});
	return renamed;
};

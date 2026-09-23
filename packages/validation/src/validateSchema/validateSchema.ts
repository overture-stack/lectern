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

import type { DataRecord, Schema } from '@overture-stack/lectern-dictionary';
import { TypeUtils } from '@overture-stack/lectern-dictionary';
import { invalid, valid, type TestResult } from '../types';
import { validateRecord } from '../validateRecord';
import { generateDataSetHashMap, type RecordIdGenerator } from './restrictions/generateDataSetHashMap';
import { testUniqueFieldRestriction } from './restrictions/uniqueField/testUniqueFieldRestriction';
import { testUniqueKey } from './restrictions/uniqueKey/testUniqueKey';
import type { SchemaValidationError, SchemaValidationRecordErrorDetails } from './SchemaValidationError';

export type ValidateSchemaOptions = {
	recordId?: RecordIdGenerator;
};

/**
 * Validate a data set using a Lectern Schema. The data to validate is an array of DataRecords that contains all
 * records for the given schema. Each record of the data set will be validated individually, plus schema level
 * validation tests will be applied.
 *
 * Validation tests specific to Schema validation are:
 * - unique fields: for any fields marked as unique, this will check if there are multiple records with the same value
 * - uniqueKey: if the schema has a uniqueKey defined, this will check if there are multiple records with the same
 *   uniqueKey value
 *
 * @param records
 * @param schema
 * @param options.recordId Optional function to derive a string ID for each record, used in `matchingRecords` on
 *   errors. Defaults to the record's array index as a string.
 * @returns
 */
export const validateSchema = (
	records: Array<DataRecord>,
	schema: Schema,
	options?: ValidateSchemaOptions,
): TestResult<SchemaValidationError[]> => {
	const uniqueKeyRule = schema.restrictions?.uniqueKey;
	const uniqueKeyMap =
		uniqueKeyRule && uniqueKeyRule.length > 0
			? generateDataSetHashMap(records, uniqueKeyRule, options?.recordId)
			: undefined;

	const uniqueFieldMaps = new Map<string, Map<string, string[]>>();
	schema.fields.forEach((field) => {
		if (field.unique) {
			uniqueFieldMaps.set(field.name, generateDataSetHashMap(records, [field.name], options?.recordId));
		}
	});

	const schemaValidationErrors = records
		.map<SchemaValidationError | undefined>((record, index) => {
			const recordId = options?.recordId?.(record, index) ?? String(index);
			const recordErrors: SchemaValidationRecordErrorDetails[] = [];

			const uniqueKeyResult =
				uniqueKeyMap && uniqueKeyRule ? testUniqueKey(record, uniqueKeyRule, uniqueKeyMap) : valid();
			if (!uniqueKeyResult.valid) {
				recordErrors.push(uniqueKeyResult.details);
			}

			uniqueFieldMaps.forEach((hashMap, fieldName) => {
				const uniqueFieldResult = testUniqueFieldRestriction(record[fieldName], fieldName, hashMap);
				if (!uniqueFieldResult.valid) {
					recordErrors.push(uniqueFieldResult.details);
				}
			});

			const recordValidationResult = validateRecord(record, schema);
			if (!recordValidationResult.valid) {
				recordErrors.push(...recordValidationResult.details);
			}
			return recordErrors.length ? { recordIndex: recordId, recordErrors } : undefined;
		})
		.filter(TypeUtils.isDefined);
	return schemaValidationErrors.length ? invalid(schemaValidationErrors) : valid();
};

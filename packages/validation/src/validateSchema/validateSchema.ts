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

import type { DataRecord, Schema } from 'dictionary';
import { invalid, valid, type TestResult } from '../types';
import type { SchemaValidationError, SchemaValidationRecordErrorDetails } from './SchemaValidationError';
import { validateRecord } from '../validateRecord';
import { generateDataSetHashMap } from './restrictions/generateDataSetHashMap';
import { testUniqueKey } from './restrictions/uniqueKey/testUniqueKey';
import { isDefined } from 'common';
import { testUniqueFieldRestriction } from './restrictions/uniqueField/testUniqueFieldRestriction';

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
 * @returns
 */
export const validateSchema = (records: Array<DataRecord>, schema: Schema): TestResult<SchemaValidationError[]> => {
	// Setup to improve performance of Schema validations that compare a record to every record in the data set.
	// We build maps of uniqueKey and unique field values so that they can be used while testing these restricitons for each record
	const uniqueKeyRule = schema.restrictions?.uniqueKey;
	const uniqueKeyMap =
		uniqueKeyRule && uniqueKeyRule.length > 0 ? generateDataSetHashMap(records, uniqueKeyRule) : undefined;

	const uniqueFieldMaps = new Map<string, Map<string, number[]>>();
	schema.fields.forEach((field) => {
		if (field.restrictions?.unique) {
			uniqueFieldMaps.set(field.name, generateDataSetHashMap(records, [field.name]));
		}
	});

	// Test each record, apply the schema restrictions to
	const schemaValidationErrors = records
		.map<SchemaValidationError | undefined>((record, recordIndex) => {
			// recordErrors is output collection of errors for this record
			const recordErrors: SchemaValidationRecordErrorDetails[] = [];

			// UniqueKey Test
			const uniqueKeyResult =
				uniqueKeyMap && uniqueKeyRule ? testUniqueKey(record, uniqueKeyRule, uniqueKeyMap) : valid();
			if (!uniqueKeyResult.valid) {
				recordErrors.push(uniqueKeyResult.info);
			}

			// Unique Field Restriction Tests
			uniqueFieldMaps.forEach((hashMap, fieldName) => {
				const uniqueFieldResult = testUniqueFieldRestriction(record[fieldName], fieldName, hashMap);
				if (!uniqueFieldResult.valid) {
					recordErrors.push(uniqueFieldResult.info);
				}
			});

			// Data Record validation
			const recordValidationResult = validateRecord(record, schema);
			if (!recordValidationResult.valid) {
				recordErrors.push(...recordValidationResult.info);
			}
			return recordErrors.length ? { recordIndex, recordErrors } : undefined;
		})
		.filter(isDefined);
	return schemaValidationErrors.length ? invalid(schemaValidationErrors) : valid();
};

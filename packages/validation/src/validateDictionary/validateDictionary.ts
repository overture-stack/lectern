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

import { DataRecord, Dictionary, TypeUtils } from 'dictionary';
import { invalid, valid, type TestResult } from '../types';
import { validateSchema, type SchemaRecordError } from '../validateSchema';
import { collectSchemaReferenceData } from './collectSchemaReferenceData';
import type {
	DictionaryValidationError,
	DictionaryValidationErrorRecordForeignKey,
	DictionaryValidationRecordErrorDetails,
} from './DictionaryValidationError';
import { testForeignKeyRestriction } from './testForeignKeyRestriction';
import { testUnrecognizedSchema } from './testUnrecognizedSchema';

const mergeSchemaRecordValidationErrors = <T>(
	first: Array<SchemaRecordError<T>>,
	second: Array<SchemaRecordError<T>>,
): Array<SchemaRecordError<T>> => {
	const output: Array<SchemaRecordError<T>> = [...first];
	for (const error of second) {
		const matchedError = output.find((outputError) => outputError.recordIndex === error.recordIndex);
		if (matchedError) {
			matchedError.recordErrors.push(...error.recordErrors);
		} else {
			output.push(error);
		}
	}
	return output;
};

/**
 *
 * @param data
 * @param dictionary
 * @returns
 */
export const validateDictionary = (
	data: Record<string, DataRecord[]>,
	dictionary: Dictionary,
): TestResult<DictionaryValidationError[]> => {
	// check all schemas are recognized
	// this map.filter.map loop would have performance concerns except that the expected use case will always have small list of schemas
	// If needed, we can collect this into a function that performs a single reduce.
	const unrecognizedSchemaErrors = Object.keys(data)
		.map((schemaName) => testUnrecognizedSchema(schemaName, dictionary))
		.filter((result) => !result.valid)
		.map((result) => result.details);

	const foreignSchemaReferenceData = collectSchemaReferenceData(data, dictionary);

	const recognizedSchemaErrors: DictionaryValidationError[] = dictionary.schemas
		.map<DictionaryValidationError | undefined>((schema) => {
			const records = data[schema.name] || [];
			const schemaValidationResult = validateSchema(records, schema);

			const foreignKeyRestriction = schema.restrictions?.foreignKey;
			const foreignKeyErrors: SchemaRecordError<DictionaryValidationErrorRecordForeignKey>[] = foreignKeyRestriction
				? records
						.map((record, recordIndex) => {
							const foreignKeyTestResult = testForeignKeyRestriction(
								record,
								foreignKeyRestriction,
								foreignSchemaReferenceData,
							);
							if (foreignKeyTestResult.valid) {
								return undefined;
							}
							return {
								recordIndex,
								recordErrors: foreignKeyTestResult.details,
							};
						})
						.filter(TypeUtils.isDefined)
				: [];
			const combinedErrors = mergeSchemaRecordValidationErrors<DictionaryValidationRecordErrorDetails>(
				schemaValidationResult.valid ? [] : schemaValidationResult.details,
				foreignKeyErrors,
			);

			return combinedErrors.length
				? { reason: 'INVALID_RECORDS', schemaName: schema.name, invalidRecords: combinedErrors }
				: undefined;
		})
		.filter(TypeUtils.isDefined);

	const collectedResults: DictionaryValidationError[] = [...unrecognizedSchemaErrors, ...recognizedSchemaErrors];

	if (collectedResults.length) {
		return invalid(collectedResults);
	}

	return valid();
};

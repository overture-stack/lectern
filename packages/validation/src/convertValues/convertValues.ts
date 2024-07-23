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

import { failure, failWith, success, type Result } from 'common';
import {
	DEFAULT_DELIMITER,
	type ArrayDataValue,
	type DataRecord,
	type DataRecordValue,
	type Dictionary,
	type RestrictionCodeListString,
	type Schema,
	type SchemaField,
	type SchemaFieldValueType,
	type UnprocessedDataRecord,
} from 'dictionary';
import { isInteger, isNumber } from '../utils/typeUtils';
import type {
	ConvertFieldError,
	ConvertDictionaryData,
	ConvertDictionaryFailure,
	ConvertDictionaryResult,
	ConvertRecordResult,
	ConvertSchemaResult,
	ConvertSchemaError,
} from './ConvertValuesResult';
import { matchCodeListFormatting } from './matchCodeListFormatting';

/* === Type Specific conversion functions === */
// Note: These are intended to be passed only normalized values that have already passed through the

const convertString = (value: string): Result<string> => {
	if (value === '') {
		return failure('Empty value.');
	}

	return success(value);
};
const convertNumber = (value: string): Result<number> => {
	const errorText = 'Not a valid number.';
	if (value === '') {
		return failure(errorText);
	}
	const output = Number(value);
	return isNumber(output) ? success(output) : failure(errorText);
};
const convertInteger = (value: string): Result<number> => {
	const errorText = 'Not a valid number.';
	if (value === '') {
		return failure(errorText);
	}
	const output = Number(value);
	return isInteger(output) ? success(output) : failure(errorText);
};
const convertBoolean = (value: string): Result<boolean> => {
	const formatted = value.toLowerCase();
	return formatted === 'true'
		? success(true)
		: formatted === 'false'
			? success(false)
			: failure('Not a valid boolean.');
};
const fieldConverters = {
	boolean: convertBoolean,
	integer: convertInteger,
	number: convertNumber,
	string: convertString,
} as const satisfies Record<SchemaFieldValueType, Function>;

/* === Convert functions for single and array values === */

/**
 * Clean up input string before converting. Performs the following transformations:
 * 1. Trims value
 * @param value
 * @returns
 */
const normalizeValue = (value: string): string => {
	const trimmed = value.trim();
	return trimmed;
};

const convertValue = (value: string, fieldDefinition: SchemaField) => {
	const normalizedValue = normalizeValue(value);

	// Empty values are treated as `undefined`
	if (normalizedValue === '') {
		return success(undefined);
	}
	const result = fieldConverters[fieldDefinition.valueType](normalizedValue);

	if (result.success && fieldDefinition.valueType === 'string') {
		// extra step to ensure strings match the formatting of codeList values, if they have one
		return success(matchCodeListFormatting(normalizedValue, fieldDefinition));
	}

	return result;
};

const convertArrayValue = (value: string, fieldDefinition: SchemaField): Result<ArrayDataValue> => {
	/**
	 * Locally scoped function that will use a function from `fieldConverters` to convert every value in the array.
	 * */
	const convertSplitValues = <T>(
		splitValues: string[],
		conversionFunction: (value: string) => Result<T>,
	): Result<T[]> => {
		const results = splitValues.map(normalizeValue).map(conversionFunction);
		const output: T[] = [];
		for (const result of results) {
			if (!result.success) {
				return failure('One or more values in array could not be converted.');
			}
			output.push(result.data);
		}
		return success(output);
	};

	/* === Start of convertArrayValue logic === */
	const { valueType } = fieldDefinition;
	const delimiter = DEFAULT_DELIMITER;

	const normalizedValue = normalizeValue(value);
	if (normalizedValue === '') {
		return success([]);
	}

	const splitValues = normalizedValue.split(delimiter);
	// Behold a usless switch, the whole purpose of which is to convince TS that the dataType has a single, known value,
	// and therefore the output string has a single, known value.
	switch (valueType) {
		case 'boolean': {
			return convertSplitValues(splitValues, fieldConverters[valueType]);
		}
		case 'integer': {
			return convertSplitValues(splitValues, fieldConverters[valueType]);
		}
		case 'number': {
			return convertSplitValues(splitValues, fieldConverters[valueType]);
		}
		case 'string': {
			const result = convertSplitValues(splitValues, fieldConverters[valueType]);
			if (result.success) {
				const formattedValues = result.data.map((value) => matchCodeListFormatting(value, fieldDefinition));
				return success(formattedValues);
			}
			return result;
		}
	}
};

/**
 * Take a string value and convert it to the type defined in the fieldDefinition.
 *
 * If the field is an array, this will split the field into separate values and attempt to convert each of those values.
 * If any of the values in the array fails to convert, the entire value conversion will fail.
 */
export function convertFieldValue(value: string, fieldDefinition: SchemaField): Result<DataRecordValue> {
	const { isArray } = fieldDefinition;
	return isArray ? convertArrayValue(value, fieldDefinition) : convertValue(value, fieldDefinition);
}

/**
 * Convert string values to properly typed values for fields from their schema definition.
 *
 * If there are any type errors found during conversion, this will return a failed `Result`
 * with a list of the `ConvertTypeErrors`.
 *
 * If a field is in the record that is not found in the schema, this will return a faile `Result`
 * indicating the unrecognized field. Its value will remain a string without any conversion.
 */
export function convertRecordValues(record: UnprocessedDataRecord, schema: Schema): ConvertRecordResult {
	const errors: ConvertFieldError[] = [];
	const output: DataRecord = {};

	for (const [fieldName, stringValue] of Object.entries(record)) {
		const fieldDefinition = schema.fields.find((field) => field.name === fieldName);
		if (!fieldDefinition) {
			// can't convert this field since no definition provided, we will put it in the output unconverted.
			output[fieldName] = stringValue;
			errors.push({
				reason: 'UNRECOGNIZED_FIELD',
				fieldName,
				fieldValue: stringValue,
			});
			continue;
		}
		const convertResult = convertFieldValue(stringValue, fieldDefinition);

		if (convertResult.success) {
			output[fieldName] = convertResult.data;
		} else {
			errors.push({
				reason: 'INVALID_VALUE_TYPE',
				fieldName,
				fieldValue: stringValue,
				isArray: !!fieldDefinition.isArray,
				valueType: fieldDefinition.valueType,
			});
			// add original string value as value for field in record since we couldnt convert
			output[fieldName] = stringValue;
		}
	}
	if (errors.length) {
		return failWith(`Errors were found while converting record data.`, {
			record: output,
			errors,
		});
	}
	return success({ record: output });
}

/**
 *
 */
export function convertSchemaValues(records: UnprocessedDataRecord[], schema: Schema): ConvertSchemaResult {
	const output: DataRecord[] = [];
	const errors: ConvertSchemaError[] = [];

	records.forEach((record, recordIndex) => {
		const conversionResult = convertRecordValues(record, schema);

		output.push(conversionResult.data.record);
		if (!conversionResult.success) {
			errors.push({
				recordIndex,
				recordErrors: conversionResult.data.errors,
			});
		}
	});

	return errors.length
		? failWith(`Errors were found while converting schema data.`, { records: output, errors })
		: success({ records: output });
}

export function convertDictionaryValues(
	schemaData: Record<string, UnprocessedDataRecord[]>,
	dictionary: Dictionary,
): ConvertDictionaryResult {
	const output: ConvertDictionaryData = {};
	for (const [schemaName, records] of Object.entries(schemaData)) {
		const schema = dictionary.schemas.find((schema) => schema.name === schemaName);

		if (schema) {
			const result = convertSchemaValues(records, schema);
			if (result.success) {
				output[schemaName] = result;
			} else {
				output[schemaName] = failWith<ConvertDictionaryFailure>(result.message, {
					reason: 'INVALID_RECORDS',
					...result.data,
				});
			}
		} else {
			output[schemaName] = failWith<ConvertDictionaryFailure>(`There is no schema of this name in the dictionary.`, {
				reason: 'UNRECOGNIZED_SCHEMA',
				records,
			});
		}
	}
	const allSucceeded = Object.values(output).every((result) => result.success);
	return allSucceeded ? success(output) : failWith(`Errors were found while converting dictionary data.`, output);
}

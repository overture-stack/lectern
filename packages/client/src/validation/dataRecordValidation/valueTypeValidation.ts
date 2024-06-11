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

import { SchemaFieldValueType } from 'dictionary';

import { convertToArray, isEmpty, isEmptyString, isStringArray, notEmpty } from '../../utils';
import {
	INVALID_VALUE_ERROR_MESSAGE,
	SchemaValidationErrorTypes,
	type BaseSchemaValidationError,
	type ValueTypeValidationError,
} from '../types/validationErrorTypes';
import type { UnprocessedRecordValidationFunction, ValidationFunction } from '../types/validationFunctionTypes';

/**
 * Test the values provided to every field in a DataRecord to find any non-array fields that
 * have array values.
 * @param record Data Record with original string values provided in data file
 * @param index
 * @param schemaFields
 * @returns
 */
export const validateNonArrayFields: UnprocessedRecordValidationFunction = (
	record,
	index,
	schemaFields,
): ValueTypeValidationError[] => {
	return schemaFields
		.map((field) => {
			const value = record[field.name];
			if (!field.isArray && isStringArray(value)) {
				return buildFieldValueTypeError({ fieldName: field.name, index }, { value });
			}
			return undefined;
		})
		.filter(notEmpty);
};

/**
 * Test the values provided to every field in a DataRecord to find any values that cannot be
 * converted to the required type defined in the field schema
 * @param record Data Record with original string values provided in data file
 * @param index
 * @param schemaFields
 * @returns
 */
export const validateValueTypes: UnprocessedRecordValidationFunction = (
	record,
	index,
	schemaFields,
): ValueTypeValidationError[] => {
	return schemaFields
		.map((field) => {
			if (isEmpty(record[field.name])) {
				return undefined;
			}

			const recordFieldValues = convertToArray(record[field.name]); // put all values into array
			const invalidValues = recordFieldValues.filter((v) => v !== undefined && isInvalidFieldType(field.valueType, v));
			const info = { value: invalidValues };

			if (invalidValues.length !== 0) {
				return buildFieldValueTypeError({ fieldName: field.name, index }, info);
			}
			return undefined;
		})
		.filter(notEmpty);
};

/**
 * Check a value is valid for a given schema value type.
 * @param valueType
 * @param value
 * @returns
 */
const isInvalidFieldType = (valueType: SchemaFieldValueType, value: string) => {
	// optional field if the value is absent at this point
	if (isEmptyString(value)) return false;
	switch (valueType) {
		case SchemaFieldValueType.Values.string:
			return false;
		case SchemaFieldValueType.Values.integer:
			return !Number.isSafeInteger(Number(value));
		case SchemaFieldValueType.Values.number:
			return isNaN(Number(value));
		case SchemaFieldValueType.Values.boolean:
			return !(value.toLowerCase() === 'true' || value.toLowerCase() === 'false');
	}
};

const buildFieldValueTypeError = (
	errorData: BaseSchemaValidationError,
	info: ValueTypeValidationError['info'],
): ValueTypeValidationError => {
	const message = INVALID_VALUE_ERROR_MESSAGE;
	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_FIELD_VALUE_TYPE,
		info,
		message,
	};
};

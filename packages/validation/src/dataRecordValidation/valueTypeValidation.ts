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

import { asArray, isDefined } from 'common';
import { REGEXP_BOOLEAN_VALUE, SchemaFieldValueType } from 'dictionary';
import {
	INVALID_VALUE_ERROR_MESSAGE,
	SchemaValidationErrorTypes,
	type BaseSchemaValidationError,
	type ValueTypeValidationError,
} from '../types/deprecated/validationErrorTypes';
import type { UnprocessedRecordValidationFunction } from '../types/deprecated/validationFunctionTypes';
import { isEmptyString } from '../utils/isEmptyString';

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
			if (!field.isArray && Array.isArray(value)) {
				return buildFieldValueTypeError({ fieldName: field.name, index }, { value });
			}
			return undefined;
		})
		.filter(isDefined);
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
			const invalidValues = asArray(record[field.name]).filter(
				(value) => value !== undefined && !isValidFieldType(field.valueType, value),
			);
			const info = { value: invalidValues };

			if (invalidValues.length !== 0) {
				return buildFieldValueTypeError({ fieldName: field.name, index }, info);
			}
			return undefined;
		})
		.filter(isDefined);
};

/**
 * Check a value is valid for a given schema value type.
 * @param valueType
 * @param value
 * @returns
 */
const isValidFieldType = (valueType: SchemaFieldValueType, value: string): boolean => {
	if (isEmptyString(value)) {
		return true;
	}
	switch (valueType) {
		case SchemaFieldValueType.Values.boolean:
			return isValidBoolean(value);
		case SchemaFieldValueType.Values.integer:
			return isValidInteger(value);
		case SchemaFieldValueType.Values.number:
			return isValidNumber(value);
		case SchemaFieldValueType.Values.string:
			// input values all start as strings so this is valid in all cases
			return true;
	}
};

const isValidInteger = (value: string): boolean => Number.isSafeInteger(Number(value));
const isValidNumber = (value: string): boolean => isFinite(Number(value));
const isValidBoolean = (value: string): boolean => value.trim().match(REGEXP_BOOLEAN_VALUE) !== null;

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

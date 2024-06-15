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

import _ from 'lodash';

import { Singular } from 'common';
import {
	DataRecord,
	DataRecordValue,
	UnprocessedDataRecord,
	Schema,
	SchemaField,
	SchemaFieldValueType,
} from 'dictionary';

import { convertToArray, isEmpty } from '../utils';
import { SchemaValidationError, SchemaValidationErrorTypes } from '@overture-stack/lectern-validation';

/**
 * Warning:
 * This needs to be provided records that have already had their types validated, there is little to no checking that the values
 * this converts will be correct, and no errors are thrown by failed conversions.
 *
 * @param schemaDef
 * @param record
 * @param index
 * @param recordErrors
 * @returns
 */
export const convertFromRawStrings = (
	schemaDef: Schema,
	record: UnprocessedDataRecord,
	index: number,
	recordErrors: ReadonlyArray<SchemaValidationError>,
): DataRecord => {
	const mutableRecord: DataRecord = { ...record };
	schemaDef.fields.forEach((field) => {
		// if there was an error for this field don't convert it. this means a string was passed instead of number or boolean
		// this allows us to continue other validations without hiding possible errors downstream.

		if (
			recordErrors.find(
				(er) => er.errorType === SchemaValidationErrorTypes.INVALID_FIELD_VALUE_TYPE && er.fieldName === field.name,
			)
		) {
			return undefined;
		}

		/*
		 * if the field is missing from the records don't set it to undefined
		 */
		if (!_.has(record, field.name)) {
			return;
		}

		// need to check how it behaves for record[field.name] === ""
		if (isEmpty(record[field.name])) {
			mutableRecord[field.name] = undefined;
			return;
		}

		const rawValue = record[field.name];

		if (field.isArray) {
			const rawValueAsArray = convertToArray(rawValue);
			// TODO: Keeping this type assertion for during the type refactoring process. We need to refactor how values are validated as matching their corresponding types
			//  refactoring type checking/conversion will result in combining the conversion and type checking code into a single place. Right now its possible to run the converter
			//  on values that have not been properly validated.
			// This type assertion is needed because the code as is results in teh type `(string | number | boolean | undefined)[]` instead of `string[] | number[] | boolean[] | undefined`
			mutableRecord[field.name] = rawValueAsArray.map((value) => getTypedValue(field, value)) as DataRecordValue;
		} else {
			const rawValueAsString = Array.isArray(rawValue) ? rawValue.join('') : rawValue;
			mutableRecord[field.name] = getTypedValue(field, rawValueAsString);
		}
	});
	return mutableRecord;
};

const getTypedValue = (field: SchemaField, rawValue: string): Singular<DataRecordValue> => {
	switch (field.valueType) {
		case SchemaFieldValueType.Values.boolean: {
			return Boolean(rawValue.toLowerCase());
		}
		case SchemaFieldValueType.Values.integer: {
			return Number(rawValue);
		}
		case SchemaFieldValueType.Values.number: {
			return Number(rawValue);
		}
		case SchemaFieldValueType.Values.string: {
			// For string fields with a codeList restriction:
			// we want to format the value with the same letter cases as is defined in the codeList
			if (field.restrictions?.codeList && Array.isArray(field.restrictions.codeList)) {
				const formattedField = field.restrictions.codeList.find(
					(codeListOption) => codeListOption.toString().toLowerCase() === rawValue.toString().toLowerCase(),
				);
				if (formattedField) {
					return formattedField;
				}
			}

			// Return original string
			return rawValue;
		}
	}
};

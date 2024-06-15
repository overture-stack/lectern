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

import { asArray } from 'common';
import {
	BaseSchemaValidationError,
	EnumValueValidationError,
	INVALID_VALUE_ERROR_MESSAGE,
	SchemaValidationErrorTypes,
} from '../types/validationErrorTypes';
import { ValidationFunction } from '../types/validationFunctionTypes';
import { isEmptyString } from '../utils/isEmptyString';
import { isDefined } from '../utils/typeUtils';

/**
 * Check all values of a DataRecord pass codeList restrictions in their schema.
 * @param rec
 * @param index
 * @param fields
 * @returns
 */
export const validateCodeList: ValidationFunction = (rec, index, fields): EnumValueValidationError[] => {
	return fields
		.map((field) => {
			if (field.restrictions && 'codeList' in field.restrictions && field.restrictions.codeList !== undefined) {
				const codeList = field.restrictions.codeList;
				if (!Array.isArray(codeList)) {
					// codeList restriction is a string, not array. This happens when the references have not been replaced.
					// We cannot proceed without the final array so we will return undefined.
					return undefined;
				}

				// put all values into array to standardize validation for array and non array fields
				const recordFieldValues = asArray(rec[field.name]);
				const invalidValues = recordFieldValues.filter((val) => !isValidEnumValue(codeList, val));

				if (invalidValues.length !== 0) {
					return buildCodeListError({ fieldName: field.name, index }, { value: invalidValues });
				}
			}
			return undefined;
		})
		.filter(isDefined);
};

const buildCodeListError = (
	errorData: BaseSchemaValidationError,
	info: EnumValueValidationError['info'],
): EnumValueValidationError => {
	const message = INVALID_VALUE_ERROR_MESSAGE;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_ENUM_VALUE,
		info,
		message,
	};
};

/**
 * If value exists, confirm that it matches an option in the provided code list
 * @param codeList
 * @param value
 * @returns
 */
const isValidEnumValue = (codeList: string[] | number[], value: string | boolean | number | undefined) => {
	// do not run validation on empty values
	if (value === undefined || (typeof value === 'string' && isEmptyString(value))) {
		return true;
	}

	return codeList.some((allowedValue) => allowedValue === value);
};

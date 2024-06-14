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
	BaseSchemaValidationError,
	RegexValidationError,
	SchemaValidationErrorTypes,
} from '../types/validationErrorTypes';
import { ValidationFunction } from '../types/validationFunctionTypes';

/**
 * Check all values of a DataRecord pass regex restrictions in their schema.
 * @param record
 * @param index
 * @param fields
 * @returns
 */
export const validateRegex: ValidationFunction = (record, index, fields): RegexValidationError[] => {
	return fields
		.map((field) => {
			if (
				field.valueType === SchemaFieldValueType.Values.string &&
				field.restrictions &&
				!isEmpty(field.restrictions.regex)
			) {
				const regex = field.restrictions.regex;
				const recordFieldValues = convertToArray(record[field.name]);
				if (!isStringArray(recordFieldValues)) {
					// This field value should be string or string array, we will skip validation if the type is wrong.
					return undefined;
				}

				const invalidValues = recordFieldValues.filter((v) => isInvalidRegexValue(regex, v));
				if (invalidValues.length !== 0) {
					const examples = typeof field.meta?.examples === 'string' ? field.meta.examples : undefined;

					return buildRegexError({ fieldName: field.name, index }, { value: invalidValues, regex, examples });
				}
			}

			// Field does not have regex validation
			return undefined;
		})
		.filter(notEmpty);
};

const isInvalidRegexValue = (regex: string, value: string) => {
	// optional field if the value is absent at this point
	if (isEmptyString(value)) return false;
	const regexPattern = new RegExp(regex);
	return !regexPattern.test(value);
};

const buildRegexError = (
	errorData: BaseSchemaValidationError,
	info: RegexValidationError['info'],
): RegexValidationError => {
	const examplesMessage = info.examples ? ` Examples: ${info.examples}` : '';
	const message = `The value is not a permissible for this field, it must meet the regular expression: "${info.regex}".${examplesMessage}`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_BY_REGEX,
		info,
		message,
	};
};

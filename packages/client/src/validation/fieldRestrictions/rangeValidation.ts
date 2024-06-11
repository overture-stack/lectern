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

import { RestrictionRange } from 'dictionary';
import { convertToArray, isEmpty, isNumberArray, notEmpty } from '../../utils';
import { rangeToSymbol } from '../utils/rangeToSymbol';
import {
	BaseSchemaValidationError,
	RangeValidationError,
	SchemaValidationErrorTypes,
} from '../types/validationErrorTypes';
import { ValidationFunction } from '../types/validationFunctionTypes';

/**
 * Check all values of a DataRecord pass range restrictions in their schema.
 * @param record
 * @param index
 * @param schemaFields
 * @returns
 */
export const validateRange: ValidationFunction = (record, index, schemaFields): RangeValidationError[] => {
	return schemaFields
		.map((field) => {
			const recordFieldValues = convertToArray(record[field.name]);
			if (!isNumberArray(recordFieldValues)) {
				return undefined;
			}

			const range = field.restrictions && 'range' in field.restrictions ? field.restrictions.range : undefined;
			if (isEmpty(range)) {
				return undefined;
			}

			const invalidValues = recordFieldValues.filter((value) => isOutOfRange(range, value));
			if (invalidValues.length !== 0) {
				const info = { value: invalidValues, ...range };
				return buildRangeError({ fieldName: field.name, index }, info);
			}
			return undefined;
		})
		.filter(notEmpty);
};

const buildRangeError = (
	errorData: BaseSchemaValidationError,
	info: RangeValidationError['info'],
): RangeValidationError => {
	const message = `Value is out of permissible range, it must be ${rangeToSymbol(info)}.`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_BY_RANGE,
		info,
		message,
	};
};

const isOutOfRange = (range: RestrictionRange, value: number | undefined) => {
	if (value === undefined) return false;
	const invalidRange =
		// less than the min if defined ?
		(range.min !== undefined && value < range.min) ||
		(range.exclusiveMin !== undefined && value <= range.exclusiveMin) ||
		// bigger than max if defined ?
		(range.max !== undefined && value > range.max) ||
		(range.exclusiveMax !== undefined && value >= range.exclusiveMax);
	return invalidRange;
};

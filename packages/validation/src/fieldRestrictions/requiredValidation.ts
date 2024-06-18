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

import { DataRecord, SchemaField } from 'dictionary';
import {
	BaseSchemaValidationError,
	MissingRequiredFieldValidationError,
	SchemaValidationErrorTypes,
} from '../types/validationErrorTypes';
import { ValidationFunction } from '../types/validationFunctionTypes';
import { isDefined } from '../utils/typeUtils';
import { asArray } from 'common';
import { isEmptyString } from '../utils/isEmptyString';

/**
 * Check all values of a DataRecord pass required restrictions in their schema.
 * @param record
 * @param index
 * @param fields
 * @returns
 */
export const validateRequiredFields: ValidationFunction = (
	record,
	index,
	fields,
): MissingRequiredFieldValidationError[] => {
	return fields
		.map((field) => {
			if (isRequiredMissing(field, record)) {
				return buildRequiredError({ fieldName: field.name, index }, {});
			}
			return undefined;
		})
		.filter(isDefined);
};

const buildRequiredError = (
	errorData: BaseSchemaValidationError,
	info: MissingRequiredFieldValidationError['info'],
): MissingRequiredFieldValidationError => {
	const message = `${errorData.fieldName} is a required field.`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.MISSING_REQUIRED_FIELD,
		info,
		message,
	};
};

const isRequiredMissing = (field: SchemaField, record: DataRecord) => {
	const isRequired = field.restrictions && field.restrictions.required;
	if (!isRequired) {
		return false;
	}

	// a required field is missing if there are is no value provided for this field (or if an array, all array values are empty)
	return asArray(record[field.name]).every(
		(item) => item === undefined || (typeof item === 'string' && isEmptyString(item)),
	);
};

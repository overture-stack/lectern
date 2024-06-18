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

import {
	BaseSchemaValidationError,
	SchemaValidationErrorTypes,
	UniqueKeyValidationError,
} from '../types/validationErrorTypes';
import { DatasetValidationFunction } from '../types/validationFunctionTypes';
import { findDuplicateKeys, selectFieldsFromDataset } from '../utils/datasetUtils';

export const validateUniqueKey: DatasetValidationFunction = (dataset, schema): UniqueKeyValidationError[] => {
	const errors: Array<UniqueKeyValidationError> = [];
	const uniqueKeyRestriction = schema?.restrictions?.uniqueKey;
	if (uniqueKeyRestriction) {
		const uniqueKeyFields: string[] = uniqueKeyRestriction;
		const keysToValidate = selectFieldsFromDataset(dataset, uniqueKeyFields);
		const duplicateKeys = findDuplicateKeys(keysToValidate);

		duplicateKeys.forEach(([index, record]) => {
			const info = { uniqueKeyFields: uniqueKeyFields, value: record };
			errors.push(buildUniqueKeyError({ fieldName: uniqueKeyFields.join(', '), index }, info));
		});
	}
	return errors;
};

const buildUniqueKeyError = (
	errorData: BaseSchemaValidationError,
	info: UniqueKeyValidationError['info'],
): UniqueKeyValidationError => {
	const uniqueKeyFields = info.uniqueKeyFields;
	const record = info.value;
	const formattedKeyValues = uniqueKeyFields.map((fieldName) => {
		if (fieldName in record) {
			const value = record[fieldName];
			if (Array.isArray(value)) {
				return `${fieldName}: [${value.join(', ')}]`;
			} else {
				return `${fieldName}: ${value === '' ? 'null' : value}`;
			}
		}
	});
	const valuesAsString = formattedKeyValues.join(', ');
	const message = `UniqueKey field values "${valuesAsString}" must be unique.`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_BY_UNIQUE_KEY,
		info,
		message,
	};
};

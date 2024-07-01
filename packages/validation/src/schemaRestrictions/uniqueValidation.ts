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
	UniqueValidationError,
} from '../types/deprecated/validationErrorTypes';
import { DatasetValidationFunction } from '../types/deprecated/validationFunctionTypes';
import { findDuplicateKeys, selectFieldsFromDataset } from '../utils/datasetUtils';

/**
 * Validate all unique field restrictions in a schema. This will find all records that have duplicate
 * values for fields that are restricted to being unique.
 * @param data
 * @param schema
 * @returns
 */
export const validateUnique: DatasetValidationFunction = (data, schema): UniqueValidationError[] => {
	const errors: Array<UniqueValidationError> = [];
	schema.fields.forEach((field) => {
		const unique = field.restrictions?.unique || undefined;
		if (!unique) return undefined;
		const keysToValidate = selectFieldsFromDataset(data, [field.name]);
		const duplicateKeys = findDuplicateKeys(keysToValidate);

		duplicateKeys.forEach(([index, record]) => {
			const info = { value: record[field.name] };
			errors.push(buildUniqueError({ fieldName: field.name, index }, info));
		});
	});
	return errors;
};

const buildUniqueError = (
	errorData: BaseSchemaValidationError,
	info: UniqueValidationError['info'],
): UniqueValidationError => {
	const message = `Values for column "${errorData.fieldName}" must be unique.`;

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.INVALID_BY_UNIQUE,
		info,
		message,
	};
};

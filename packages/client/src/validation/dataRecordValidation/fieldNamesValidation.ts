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
	UnrecognizedFieldValidationError,
} from '../types/validationErrorTypes';
import { UnprocessedRecordValidationFunction } from '../types/validationFunctionTypes';

export const validateFieldNames: UnprocessedRecordValidationFunction = (
	record,
	index,
	fields,
): UnrecognizedFieldValidationError[] => {
	const expectedFields = new Set(fields.map((field) => field.name));
	return Object.keys(record)
		.filter((fieldName) => !expectedFields.has(fieldName))
		.map((fieldName) => buildUnrecognizedFieldError({ fieldName, index }));
};

export const buildUnrecognizedFieldError = (errorData: BaseSchemaValidationError): UnrecognizedFieldValidationError => {
	const message = `${errorData.fieldName} is not an allowed field for this schema.`;
	const info = {};

	return {
		...errorData,
		errorType: SchemaValidationErrorTypes.UNRECOGNIZED_FIELD,
		info,
		message,
	};
};

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

import { Schema, SchemaField } from 'dictionary';

import { DataRecord, UnprocessedDataRecord } from '../types/dataRecords';
import { SchemaValidationError } from './types/validationErrorTypes';
import {
	CrossSchemaValidationFunction,
	DatasetValidationFunction,
	UnprocessedRecordValidationFunction,
	ValidationFunction,
} from './types/validationFunctionTypes';

export const runUnprocessedRecordValidationPipeline = (
	record: UnprocessedDataRecord,
	index: number,
	fields: ReadonlyArray<SchemaField>,
	validationFunctions: Array<UnprocessedRecordValidationFunction>,
) => {
	let result: Array<SchemaValidationError> = [];
	for (const validationFunction of validationFunctions) {
		result = result.concat(validationFunction(record, index, getValidFields(result, fields)));
	}
	return result;
};

export const runRecordValidationPipeline = (
	record: DataRecord,
	index: number,
	fields: ReadonlyArray<SchemaField>,
	validationFunctions: Array<ValidationFunction>,
) => {
	let result: Array<SchemaValidationError> = [];
	for (const validationFunction of validationFunctions) {
		result = result.concat(validationFunction(record, index, getValidFields(result, fields)));
	}
	return result;
};

export const runDatasetValidationPipeline = (
	data: DataRecord[],
	schema: Schema,
	validationFunctions: Array<DatasetValidationFunction>,
) => validationFunctions.flatMap((validationFunction) => validationFunction(data, schema));

export const runCrossSchemaValidationPipeline = (
	schema: Schema,
	data: Record<string, DataRecord[]>,
	validationFunctions: Array<CrossSchemaValidationFunction>,
) => {
	let result: Array<SchemaValidationError> = [];
	for (const validationFunction of validationFunctions) {
		result = result.concat(validationFunction(schema, data));
	}
	return result;
};

const getValidFields = (errs: ReadonlyArray<SchemaValidationError>, fields: ReadonlyArray<SchemaField>) => {
	return fields.filter((field) => {
		return !errs.find((e) => e.fieldName === field.name);
	});
};

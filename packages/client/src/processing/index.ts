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

import * as validation from '@overture-stack/lectern-validation';
import { DataRecord, Dictionary, Schema, UnprocessedDataRecord } from 'dictionary';
import { loggerFor } from '../logger';
import {
	SchemaProcessingResult,
	type DictionaryProcessingResult,
	type RecordProcessingResult,
} from './processingResultTypes';

const L = loggerFor(__filename);

export const processDictionary = (
	data: Record<string, UnprocessedDataRecord[]>,
	dictionary: Dictionary,
): DictionaryProcessingResult => {
	const convertResult = validation.convertDictionaryValues(data, dictionary);

	if (!convertResult.success) {
		return {
			status: 'ERROR_CONVERSION',
			data: convertResult.data,
		};
	}

	const convertedData = Object.entries(convertResult.data).reduce<Record<string, DataRecord[]>>(
		(output, [schemaName, schemaConversionResult]) => {
			// Expect all schemaResults to be successful, otherwise the conversion result would have failed.
			output[schemaName] = schemaConversionResult.data.records;
			return output;
		},
		{},
	);
	const validationResult = validation.validateDictionary(convertedData, dictionary);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			data: convertedData,
			errors: validationResult.info,
		};
	}

	return {
		status: 'SUCCESS',
		data: convertedData,
	};
};

/**
 * Process a list of records for a single schema.
 *
 * Convert and then validate each record in the list.
 * @param dictionary
 * @param definition
 * @param records
 * @returns
 */
export const processSchema = (records: UnprocessedDataRecord[], schema: Schema): SchemaProcessingResult => {
	const convertResult = validation.convertSchemaValues(records, schema);

	if (!convertResult.success) {
		return {
			status: 'ERROR_CONVERSION',
			...convertResult.data,
		};
	}

	const convertedRecords = convertResult.data.records;
	const validationResult = validation.validateSchema(convertedRecords, schema);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			records: convertedRecords,
			errors: validationResult.info,
		};
	}

	return {
		status: 'SUCCESS',
		records: convertedRecords,
	};
};

/**
 * Process a single data record.
 *
 * Convert and then validate a data record. If there are errors found during conversion,
 * those errors will be returned and validation will be skipped. The final result will indicate if the
 * data processing attempt was successful, or failed due to errors in conversion or validation.
 */
export const processRecord = (schema: Schema, data: UnprocessedDataRecord): RecordProcessingResult => {
	const convertResult = validation.convertRecordValues(data, schema);

	if (!convertResult.success) {
		return {
			status: 'ERROR_CONVERSION',
			...convertResult.data,
		};
	}

	const record = convertResult.data.record;
	const validationResult = validation.validateRecord(record, schema);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			record,
			errors: validationResult.info,
		};
	}

	return {
		status: 'SUCCESS',
		record,
	};
};

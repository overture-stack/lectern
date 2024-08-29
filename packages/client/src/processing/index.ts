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
import { DataRecord, Dictionary, Schema, UnprocessedDataRecord } from '@overture-stack/lectern-dictionary';
import { loggerFor } from '../logger';
import {
	SchemaProcessingResult,
	type DictionaryProcessingResult,
	type RecordProcessingResult,
} from './processingResultTypes';

const L = loggerFor(__filename);

/**
 * Process data from multiple schemas for a dictionary.
 *
 * Parse and then validate collections of data records, with each collection belonging to a different schema.
 * The data argument is an object where each key is a schema name and each element an array of data records
 * that belong to that schema type. If there are errors found during conversion,
 * those errors will be returned and validation will be skipped. The final result will indicate if the
 * data processing attempt was successful, or failed due to errors during parsing or validation.
 * @param data
 * @param dictionary
 * @returns
 */
export const processDictionary = (
	data: Record<string, UnprocessedDataRecord[]>,
	dictionary: Dictionary,
): DictionaryProcessingResult => {
	const parsedResult = validation.parseDictionaryValues(data, dictionary);

	if (!parsedResult.success) {
		return {
			status: 'ERROR_PARSING',
			data: parsedResult.data,
		};
	}

	const parsedData = Object.entries(parsedResult.data).reduce<Record<string, DataRecord[]>>(
		(output, [schemaName, schemaConversionResult]) => {
			// Expect all schemaResults to be successful, otherwise the conversion result would have failed.
			output[schemaName] = schemaConversionResult.data.records;
			return output;
		},
		{},
	);
	const validationResult = validation.validateDictionary(parsedData, dictionary);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			data: parsedData,
			errors: validationResult.details,
		};
	}

	return {
		status: 'SUCCESS',
		data: parsedData,
	};
};

/**
 * Process a list of records for a single schema.
 *
 * Parse and then validate each record in the list. If there are errors found during conversion,
 * those errors will be returned and validation will be skipped. The final result will indicate if the
 * data processing attempt was successful, or failed due to errors during parsing or validation.
 * @param dictionary
 * @param definition
 * @param records
 * @returns
 */
export const processSchema = (records: UnprocessedDataRecord[], schema: Schema): SchemaProcessingResult => {
	const parseResult = validation.parseSchemaValues(records, schema);

	if (!parseResult.success) {
		return {
			status: 'ERROR_PARSING',
			...parseResult.data,
		};
	}

	const parsedRecords = parseResult.data.records;
	const validationResult = validation.validateSchema(parsedRecords, schema);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			records: parsedRecords,
			errors: validationResult.details,
		};
	}

	return {
		status: 'SUCCESS',
		records: parsedRecords,
	};
};

/**
 * Process a single data record.
 *
 * Parse and then validate a data record. If there are errors found during conversion,
 * those errors will be returned and validation will be skipped. The final result will indicate if the
 * data processing attempt was successful, or failed due to errors during parsing or validation.
 */
export const processRecord = (data: UnprocessedDataRecord, schema: Schema): RecordProcessingResult => {
	const parseResult = validation.parseRecordValues(data, schema);

	if (!parseResult.success) {
		return {
			status: 'ERROR_PARSING',
			...parseResult.data,
		};
	}

	const record = parseResult.data.record;
	const validationResult = validation.validateRecord(record, schema);

	if (!validationResult.valid) {
		return {
			status: 'ERROR_VALIDATION',
			record,
			errors: validationResult.details,
		};
	}

	return {
		status: 'SUCCESS',
		record,
	};
};

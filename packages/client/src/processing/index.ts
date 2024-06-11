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

import { NotFoundError } from 'common';
import { Dictionary, Schema } from 'dictionary';
import _ from 'lodash';

import { loggerFor } from '../logger';
import { DataRecord, UnprocessedDataRecord } from '../types/dataRecords';
import { convertToArray, isEmpty, isNotAbsent, isString, isStringArray, notEmpty } from '../utils';
import type { SchemaValidationError } from '../validation';
import * as validation from '../validation';
import { convertFromRawStrings } from './convertDataValueTypes';
import { BatchProcessingResult, FieldNamesByPriorityMap, SchemaProcessingResult } from './processingResultTypes';

const L = loggerFor(__filename);

export const processSchemas = (
	dictionary: Dictionary,
	schemasData: Record<string, UnprocessedDataRecord[]>,
): Record<string, BatchProcessingResult> => {
	const results: Record<string, BatchProcessingResult> = {};

	Object.keys(schemasData).forEach((schemaName) => {
		// Run validations at the record level
		const recordLevelValidationResults = processRecords(dictionary, schemaName, schemasData[schemaName]);

		// Run cross-schema validations
		const schemaDef = getNotNullSchemaDefinitionFromDictionary(dictionary, schemaName);
		const crossSchemaLevelValidationResults = validation
			.runCrossSchemaValidationPipeline(schemaDef, schemasData, [validation.validateForeignKeys])
			.filter(notEmpty);

		const allErrorsBySchema: validation.SchemaValidationError[] = [
			...recordLevelValidationResults.validationErrors,
			...crossSchemaLevelValidationResults,
		];

		results[schemaName] = {
			validationErrors: allErrorsBySchema,
			processedRecords: recordLevelValidationResults.processedRecords,
		};
	});

	return results;
};

export const processRecords = (
	dictionary: Dictionary,
	definition: string,
	records: UnprocessedDataRecord[],
): BatchProcessingResult => {
	const schemaDef = getNotNullSchemaDefinitionFromDictionary(dictionary, definition);

	let validationErrors: SchemaValidationError[] = [];
	const processedRecords: DataRecord[] = [];

	records.forEach((dataRecord, index) => {
		const result = process(dictionary, definition, dataRecord, index);
		validationErrors = validationErrors.concat(result.validationErrors);
		processedRecords.push(_.cloneDeep(result.processedRecord));
	});
	// Record set level validations
	const newErrors = validateRecordsSet(schemaDef, processedRecords);
	validationErrors.push(...newErrors);
	L.debug(
		`done processing all rows, validationErrors: ${validationErrors.length}, validRecords: ${processedRecords.length}`,
	);

	return {
		validationErrors,
		processedRecords,
	};
};

export const process = (
	dictionary: Dictionary,
	schemaName: string,
	data: Readonly<UnprocessedDataRecord>,
	index: number,
): SchemaProcessingResult => {
	const schemaDef = dictionary.schemas.find((e) => e.name === schemaName);

	if (!schemaDef) {
		throw new Error(`no schema found for : ${schemaName}`);
	}

	let validationErrors: SchemaValidationError[] = [];

	const defaultedRecord = populateDefaults(schemaDef, data, index);
	L.debug(`done populating defaults for record #${index}`);
	const result = validateUnprocessedRecord(schemaDef, defaultedRecord, index);
	L.debug(`done validation for record #${index}`);
	if (result && result.length > 0) {
		L.debug(`${result.length} validation errors for record #${index}`);
		validationErrors = validationErrors.concat(result);
	}
	const convertedRecord = convertFromRawStrings(schemaDef, defaultedRecord, index, result);
	L.debug(`converted row #${index} from raw strings`);
	const postTypeConversionValidationResult = validateAfterTypeConversion(
		schemaDef,
		_.cloneDeep(convertedRecord) as DataRecord,
		index,
	);

	if (postTypeConversionValidationResult && postTypeConversionValidationResult.length > 0) {
		validationErrors = validationErrors.concat(postTypeConversionValidationResult);
	}

	L.debug(`done processing all rows, validationErrors: ${validationErrors.length}, validRecords: ${convertedRecord}`);

	return {
		validationErrors,
		processedRecord: convertedRecord,
	};
};

const getNotNullSchemaDefinitionFromDictionary = (dictionary: Dictionary, schemaName: string): Schema => {
	const schemaDef = dictionary.schemas.find((e) => e.name === schemaName);
	if (!schemaDef) {
		throw new Error(`no schema found for : ${schemaName}`);
	}
	return schemaDef;
};

export const getSchemaFieldNamesWithPriority = (schema: Dictionary, definition: string): FieldNamesByPriorityMap => {
	const schemaDef = schema.schemas.find((schema) => schema.name === definition);
	if (!schemaDef) {
		throw new NotFoundError(`no schema found for : ${definition}`);
	}
	const fieldNamesMapped: FieldNamesByPriorityMap = { required: [], optional: [] };
	schemaDef.fields.forEach((field) => {
		if (field.restrictions?.required) {
			fieldNamesMapped.required.push(field.name);
		} else {
			fieldNamesMapped.optional.push(field.name);
		}
	});
	return fieldNamesMapped;
};

/**
 * Populate the passed records with the default value based on the field name if the field is
 * missing from the records it will NOT be added.
 * @param definition the name of the schema definition to use for these records
 * @param records the list of records to populate with the default values.
 */
const populateDefaults = (schemaDef: Schema, record: UnprocessedDataRecord, index: number): UnprocessedDataRecord => {
	const clonedRecord = _.cloneDeep(record);
	schemaDef.fields.forEach((field) => {
		const defaultValue = field.meta && field.meta.default;
		if (isEmpty(defaultValue)) return undefined;

		const value = record[field.name];

		// data record  value is (or is expected to be) just one string
		if (isString(value) && !field.isArray) {
			if (isNotAbsent(value) && value.trim() === '') {
				L.debug(`populating Default: "${defaultValue}" for "${field.name}" of record at index ${index}`);
				clonedRecord[field.name] = `${defaultValue}`;
			}
			return undefined;
		}

		// data record value is (or is expected to be) array of string
		if (isStringArray(value) && field.isArray) {
			if (notEmpty(value) && value.every((v) => v.trim() === '')) {
				L.debug(`populating Default: "${defaultValue}" for ${field.name} of record at index ${index}`);
				const arrayDefaultValue = convertToArray(defaultValue);
				clonedRecord[field.name] = arrayDefaultValue.map((v) => `${v}`);
			}
			return undefined;
		}
	});

	return _.cloneDeep(clonedRecord);
};

/**
 * Run schema validation pipeline for a schema defintion on the list of records provided.
 * @param definition the schema definition name.
 * @param record the records to validate.
 */
const validateUnprocessedRecord = (
	schemaDef: Schema,
	record: UnprocessedDataRecord,
	index: number,
): ReadonlyArray<SchemaValidationError> => {
	const majorErrors = validation
		.runUnprocessedRecordValidationPipeline(record, index, schemaDef.fields, [
			validation.validateFieldNames,
			validation.validateNonArrayFields,
			validation.validateRequiredFields,
			validation.validateValueTypes,
		])
		.filter(notEmpty);
	return [...majorErrors];
};

const validateAfterTypeConversion = (
	schemaDef: Schema,
	record: DataRecord,
	index: number,
): ReadonlyArray<SchemaValidationError> => {
	const validationErrors = validation
		.runRecordValidationPipeline(record, index, schemaDef.fields, [
			validation.validateRegex,
			validation.validateRange,
			validation.validateCodeList,
			validation.validateScript,
		])
		.filter(notEmpty);

	return [...validationErrors];
};

function validateRecordsSet(schemaDef: Schema, processedRecords: DataRecord[]) {
	const validationErrors = validation
		.runDatasetValidationPipeline(processedRecords, schemaDef, [
			validation.validateUnique,
			validation.validateUniqueKey,
		])
		.filter(notEmpty);
	return validationErrors;
}

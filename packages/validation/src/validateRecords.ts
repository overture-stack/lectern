import type { DataRecord, DataRecordValue, Schema, SchemaField } from 'dictionary';
import { testCodeList } from './fieldRestrictions/codeListValidation';
import { testRange } from './fieldRestrictions/rangeValidation';
import { testRegex } from './fieldRestrictions/regexValidation';
import { testRequired } from './fieldRestrictions/requiredValidation';
import {
	valid,
	type FieldValidationError,
	type FieldValidationResult,
	type FieldValidationResult_RestrictionErrors,
	type FieldValidationResult_Unrecognized,
} from './types';
import type { FieldRestrictionRule } from './types/restrictionRules';
import { asArray } from 'common';

const testRestriction = (value: DataRecordValue, restriction: FieldRestrictionRule) => {
	switch (restriction.type) {
		case 'codeList': {
			return testCodeList(restriction.rule, value);
		}
		case 'range': {
			return testRange(restriction.rule, value);
		}
		case 'regex': {
			return testRegex(restriction.rule, value);
		}
		case 'required': {
			return testRequired(restriction.rule, value);
		}
		case 'unique': {
			return testRequired(restriction.rule, value);
		}
		case 'script': {
			return valid();
		}
	}
};

/**
 * Apply a list of field restriction tests to a data record value
 * @param value
 * @param restrictions
 */
const applyFieldRestrictionTests = (
	value: DataRecordValue,
	restrictions: FieldRestrictionRule[],
): FieldValidationError[] => {
	const errors = restrictions.reduce<FieldValidationError[]>((output, restriction) => {
		const result = testRestriction(value, restriction);
		if (!result.valid) {
			output.push({
				message: result.message,
				restriction,
				invalidItems: result.invalidItems,
			});
		}
		return output;
	}, []);

	return errors;
};

/**
 * Convert the restrictions found in a SchemaField definition into a list of rules that apply for this specific value
 * and DataRecord.
 */
export const resolveFieldRestrictions = (
	value: DataRecordValue,
	record: DataRecord,
	field: SchemaField,
): FieldRestrictionRule[] => {
	// TODO: This function requires value and record parameters so that conditional restrictions can be resolved.
	// The original implementation with a static set of available restrictions does not need these parameters.
	if (!field.restrictions) {
		return [];
	}

	switch (field.valueType) {
		case 'boolean': {
			const output: FieldRestrictionRule[] = [];
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			if (field.restrictions.script) {
				output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			}
			return output;
		}
		case 'integer': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.range) {
				output.push({ type: 'range', rule: field.restrictions.range });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			if (field.restrictions.script) {
				output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			}
			return output;
		}
		case 'number': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.range) {
				output.push({ type: 'range', rule: field.restrictions.range });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			if (field.restrictions.script) {
				output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			}
			return output;
		}
		case 'string': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			if (field.restrictions.script) {
				output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			}
			return output;
		}
	}
};

/**
 *
 * @param value
 * @param record
 * @param fieldDefinition
 * @returns
 */
export const validateField = (
	value: DataRecordValue,
	record: DataRecord,
	fieldDefinition: SchemaField,
): FieldValidationError[] => {
	// First we transform restrictions into a list of FieldRestrictionRules, then we apply each of these rules
	const restrictions = resolveFieldRestrictions(value, record, fieldDefinition);
	const errors = applyFieldRestrictionTests(value, restrictions);

	return errors;
};

export const validateRecord = (record: DataRecord, schema: Schema): FieldValidationResult[] => {
	// We first check if the data record has any fields that are not in our schema definition
	const unrecognizedFieldErrors = Object.entries(record).reduce<FieldValidationResult_Unrecognized[]>(
		(output, [fieldName, value]) => {
			if (!schema.fields.some((field) => field.name === fieldName)) {
				output.push({
					result: 'UNRECOGNIZED_FIELD',
					fieldName,
					value,
				});
			}
			return output;
		},
		[],
	);

	// Now we can apply the validation rules for each field in the schema.
	// If a field is missing in the record then the value will be `undefined`. This will fail a Required restriciton but pass all others.
	const fieldValidationErrors = schema.fields.reduce<FieldValidationResult_RestrictionErrors[]>((output, field) => {
		const fieldName = field.name;
		const value = record[fieldName];
		const errors = validateField(value, record, field);
		if (errors.length) {
			output.push({ result: 'INVALID', fieldName, value, errors });
		}
		return output;
	}, []);

	return [...unrecognizedFieldErrors, ...fieldValidationErrors];
};

// Next to write:
// validateSchema (list of records within one schema, adds in schema validations such as unique and uniqueKey
// validateDataSet (dictionary of many schemas worth of data, adds in validation of foreign keys and unknown entity names)

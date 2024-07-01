import type { DataRecordValue, SchemaField } from 'dictionary';
import { isBooleanArray, isInteger, isIntegerArray, isNumber, isNumberArray, isStringArray } from './typeUtils';

export const isValidValueType = (value: DataRecordValue, fieldDefinition: SchemaField): boolean => {
	switch (fieldDefinition.valueType) {
		case 'boolean': {
			return fieldDefinition.isArray ? isBooleanArray(value) : typeof value === 'boolean';
		}
		case 'integer': {
			return fieldDefinition.isArray ? isIntegerArray(value) : isInteger(value);
		}
		case 'number': {
			return fieldDefinition.isArray ? isNumberArray(value) : isNumber(value);
		}
		case 'string': {
			return fieldDefinition.isArray ? isStringArray(value) : typeof value === 'string';
		}
	}
};

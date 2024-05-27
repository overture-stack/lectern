import { Schema, SchemaField } from 'types';

/**
 * Check if a field has the required restriction set to true
 * @param field
 * @returns
 */
export const isRequiredField = (field: SchemaField): boolean =>
	Array.isArray(field.restrictions)
		? field.restrictions.some((restrictionObject) => restrictionObject.required)
		: !!field.restrictions?.required;

/**
 * Get an array of fields from this schema that have the required restriction set to true
 * @param schema
 * @returns
 */
export const getRequiredFields = (schema: Schema): SchemaField[] => schema.fields.filter(isRequiredField);

/**
 * Get an array of fields from this schema that are optional,
 * meaning they do not have the required restriction set to true
 * @param schema
 * @returns
 */
export const getOptionalFields = (schema: Schema): SchemaField[] =>
	schema.fields.filter((field) => !isRequiredField(field));

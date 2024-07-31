import type { Schema, SchemaField } from '../metaSchema';

/**
 * Get an array of fields from this schema that have the required restriction set to true
 * @param schema
 * @returns
 */
export const getRequiredFields = (schema: Schema): SchemaField[] =>
	schema.fields.filter((field) => field.restrictions?.required);

/**
 * Get an array of fields from this schema that are optional,
 * meaning they do not have the required restriction set to true
 * @param schema
 * @returns
 */
export const getOptionalFields = (schema: Schema): SchemaField[] =>
	schema.fields.filter((field) => !field.restrictions?.required);

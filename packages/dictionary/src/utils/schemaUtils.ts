import { TypeUtils } from './index.js';
import type { Schema, SchemaField } from '../metaSchema/index.js';

/**
 * Get an array of fields from this schema that have the required restriction set to true
 *
 * Note: this does not consider conditional restrictions that could make
 * the field required or optional depending on the values of each record.
 * @param schema
 * @returns
 */
export const getRequiredFields = (schema: Schema): SchemaField[] =>
	schema.fields.filter((field) =>
		TypeUtils.asArray(field.restrictions).some(
			(restrictionObject) => restrictionObject && 'required' in restrictionObject && restrictionObject?.required,
		),
	);

/**
 * Get an array of fields from this schema that are optional,
 * meaning they do not have the required restriction set to true.
 *
 * Note: this does not consider conditional restrictions that could make
 * the field required or optional depending on the values of each record.
 * @param schema
 * @returns
 */
export const getOptionalFields = (schema: Schema): SchemaField[] =>
	schema.fields.filter((field) =>
		TypeUtils.asArray(field.restrictions).every(
			(restrictionObject) => !(restrictionObject && 'required' in restrictionObject && restrictionObject?.required),
		),
	);

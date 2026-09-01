import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaAllTypesNoRestrictions = {
	name: 'all-types',
	description: 'One field of each value type. No restrictions.',
	fields: [
		{ name: 'string_field', valueType: 'string' },
		{ name: 'integer_field', valueType: 'integer' },
		{ name: 'number_field', valueType: 'number' },
		{ name: 'boolean_field', valueType: 'boolean' },
	],
} as const satisfies Schema;

assertSchema(schemaAllTypesNoRestrictions, Schema, 'schemaAllTypesNoRestrictions is not a valid Schema');

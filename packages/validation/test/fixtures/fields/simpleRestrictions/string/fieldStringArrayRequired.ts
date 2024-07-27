import type { SchemaStringField } from 'dictionary';

export const fieldStringArrayRequired = {
	name: 'string-array-required',
	isArray: true,
	valueType: 'string',
	description: 'Required field. An array with at least one string.',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaStringField;

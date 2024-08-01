import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringRequired = {
	name: 'string-required',
	valueType: 'string',
	description: 'Required field. Any string value.',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaStringField;

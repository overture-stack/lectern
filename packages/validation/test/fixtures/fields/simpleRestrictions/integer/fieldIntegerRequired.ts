import type { SchemaIntegerField } from '@overture-stack/lectern-dictionary';

export const fieldIntegerRequired = {
	name: 'integer-required',
	valueType: 'integer',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaIntegerField;

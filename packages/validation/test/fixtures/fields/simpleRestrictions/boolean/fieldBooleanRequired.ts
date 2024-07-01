import type { SchemaBooleanField } from 'dictionary';

export const fieldBooleanRequired = {
	name: 'boolean-required',
	valueType: 'boolean',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaBooleanField;

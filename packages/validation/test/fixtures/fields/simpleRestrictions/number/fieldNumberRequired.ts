import type { SchemaNumberField } from 'dictionary';

export const fieldNumberRequired = {
	name: 'number-required',
	valueType: 'number',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaNumberField;

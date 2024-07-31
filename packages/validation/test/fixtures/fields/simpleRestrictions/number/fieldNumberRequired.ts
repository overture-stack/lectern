import type { SchemaNumberField } from '@overture-stack/lectern-dictionary';

export const fieldNumberRequired = {
	name: 'number-required',
	valueType: 'number',
	restrictions: {
		required: true,
	},
} as const satisfies SchemaNumberField;

import type { SchemaNumberField } from 'dictionary';

export const fieldNumberNoRestriction = {
	name: 'any-number',
	valueType: 'number',
} as const satisfies SchemaNumberField;

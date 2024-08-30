import type { SchemaNumberField } from '@overture-stack/lectern-dictionary';

export const fieldNumberNoRestriction = {
	name: 'any-number',
	valueType: 'number',
} as const satisfies SchemaNumberField;

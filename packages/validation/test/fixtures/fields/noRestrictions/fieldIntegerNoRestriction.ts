import type { SchemaIntegerField } from 'dictionary';

export const fieldIntegerNoRestriction = {
	name: 'any-integer',
	valueType: 'integer',
} as const satisfies SchemaIntegerField;

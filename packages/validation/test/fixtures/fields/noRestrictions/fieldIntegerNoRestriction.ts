import type { SchemaIntegerField } from '@overture-stack/lectern-dictionary';

export const fieldIntegerNoRestriction = {
	name: 'any-integer',
	valueType: 'integer',
} as const satisfies SchemaIntegerField;

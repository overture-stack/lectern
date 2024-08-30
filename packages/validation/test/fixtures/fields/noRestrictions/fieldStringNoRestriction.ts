import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringNoRestriction = {
	name: 'any-string',
	valueType: 'string',
} as const satisfies SchemaStringField;

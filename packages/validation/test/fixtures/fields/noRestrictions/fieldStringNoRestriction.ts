import type { SchemaStringField } from 'dictionary';

export const fieldStringNoRestriction = {
	name: 'any-string',
	valueType: 'string',
} as const satisfies SchemaStringField;

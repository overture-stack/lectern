import type { SchemaStringField } from 'dictionary';

export const fieldStringArrayNoRestriction = {
	name: 'any-string-array',
	valueType: 'string',
	isArray: true,
} as const satisfies SchemaStringField;

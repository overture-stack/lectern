import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringArrayNoRestriction = {
	name: 'any-string-array',
	valueType: 'string',
	isArray: true,
} as const satisfies SchemaStringField;

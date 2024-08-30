import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringUnique = {
	name: 'unique-string',
	valueType: 'string',
	unique: true,
} as const satisfies SchemaStringField;

import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringUnique = {
	name: 'unique-string',
	valueType: 'string',
	restrictions: { unique: true },
} as const satisfies SchemaStringField;

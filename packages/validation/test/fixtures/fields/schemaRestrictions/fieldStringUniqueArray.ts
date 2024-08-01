import type { SchemaStringField } from '@overture-stack/lectern-dictionary';

export const fieldStringUniqueArray = {
	name: 'unique-string-array',
	valueType: 'string',
	isArray: true,
	restrictions: { unique: true },
} as const satisfies SchemaStringField;

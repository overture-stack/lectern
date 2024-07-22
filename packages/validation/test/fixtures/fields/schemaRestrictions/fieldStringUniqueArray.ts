import type { SchemaStringField } from 'dictionary';

export const fieldStringUniqueArray = {
	name: 'unique-string-array',
	valueType: 'string',
	isArray: true,
	restrictions: { unique: true },
} as const satisfies SchemaStringField;

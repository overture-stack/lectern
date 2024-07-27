import type { SchemaBooleanField } from 'dictionary';

export const fieldBooleanNoRestriction = {
	name: 'any-boolean',
	description: 'Valid values are any boolean (true or false).',
	valueType: 'boolean',
} as const satisfies SchemaBooleanField;

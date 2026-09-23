import { Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaUniqueFieldAndUniqueKey = {
	name: 'unique-field-and-unique-key',
	description: 'Contains a unique field and a composite uniqueKey restriction.',
	fields: [
		{ name: 'id', valueType: 'string', unique: true },
		{ name: 'category', valueType: 'string' },
		{ name: 'code', valueType: 'string' },
	],
	restrictions: {
		uniqueKey: ['category', 'code'],
	},
} as const satisfies Schema;

validateFixture(schemaUniqueFieldAndUniqueKey, Schema, 'schemaUniqueFieldAndUniqueKey is not a valid Schema');

import { Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaTwoUniqueFields = {
	name: 'two-unique-fields',
	description: 'Contains two string fields that are each individually unique.',
	fields: [
		{ name: 'field-a', valueType: 'string', unique: true },
		{ name: 'field-b', valueType: 'string', unique: true },
	],
} as const satisfies Schema;

validateFixture(schemaTwoUniqueFields, Schema, 'schemaTwoUniqueFields is not a valid Schema');

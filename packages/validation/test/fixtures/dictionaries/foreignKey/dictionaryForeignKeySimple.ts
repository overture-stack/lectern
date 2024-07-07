import { Dictionary, Schema } from 'dictionary';
import { validateFixture } from '../../../testUtils/validateFixture';
import { schemaAllDataTypes } from '../../schema/schemaAllDataTypes';

const schemaWithForeignKey = {
	name: 'string-matching-foreign-string',
	fields: [
		{
			name: 'string-with-foreign-key',
			valueType: 'string',
		},
	],
	restrictions: {
		foreignKey: [
			{ schema: schemaAllDataTypes.name, mappings: [{ foreign: 'any-string', local: 'string-with-foreign-key' }] },
		],
	},
} as const satisfies Schema;

validateFixture(schemaWithForeignKey, Schema, 'schemaWithForeignKey is not a valid Schema');

export const dictionaryForeignKeySimple = {
	name: 'dictionary-single-foreign-key',
	schemas: [schemaAllDataTypes, schemaWithForeignKey],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(dictionaryForeignKeySimple, Dictionary, 'dictionaryForeignKeySimple is not a valid Dictionary');

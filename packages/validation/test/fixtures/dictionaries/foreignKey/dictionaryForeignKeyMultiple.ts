import { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../../testUtils/validateFixture';
import { schemaAllDataTypes } from '../../schema/schemaAllDataTypes';
import { schemaSingleString } from '../../schema/schemaSingleString';

const schemaWithMultipleForeignKeys = {
	name: 'multiple-foreign-keys',
	fields: [
		{
			name: 'string-field',
			valueType: 'string',
		},
		{
			name: 'number-field',
			valueType: 'number',
		},
	],
	restrictions: {
		foreignKey: [
			{
				schema: schemaAllDataTypes.name,
				mappings: [
					{ foreign: 'any-string', local: 'string-field' },
					{ foreign: 'any-number', local: 'number-field' },
				],
			},
			{ schema: schemaSingleString.name, mappings: [{ foreign: 'any-string', local: 'string-field' }] },
		],
	},
} as const satisfies Schema;

validateFixture(schemaWithMultipleForeignKeys, Schema, 'schemaWithMultipleForeignKeys is not a valid Schema');

export const dictionaryForeignKeyMultiple = {
	name: 'dictionary-multiple-foreign-key',
	schemas: [schemaAllDataTypes, schemaSingleString, schemaWithMultipleForeignKeys],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(dictionaryForeignKeyMultiple, Dictionary, 'dictionaryForeignKeyMultiple is not a valid Dictionary');

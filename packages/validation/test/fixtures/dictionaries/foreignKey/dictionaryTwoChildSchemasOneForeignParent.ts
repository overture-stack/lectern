import { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../../testUtils/validateFixture';
import { schemaAllDataTypes } from '../../schema/schemaAllDataTypes';

/**
 * A dictionary where two separate child schemas each have a foreignKey restriction
 * pointing to the same parent schema (schemaAllDataTypes). Used to verify that
 * report() and errors() group violations correctly by local schema.
 */

const firstChildSchema = {
	name: 'first-child',
	fields: [
		{
			name: 'first-string-field',
			valueType: 'string',
		},
	],
	restrictions: {
		foreignKey: [
			{
				schema: schemaAllDataTypes.name,
				mappings: [{ foreign: 'any-string', local: 'first-string-field' }],
			},
		],
	},
} as const satisfies Schema;

validateFixture(firstChildSchema, Schema, 'firstChildSchema is not a valid Schema');

const secondChildSchema = {
	name: 'second-child',
	fields: [
		{
			name: 'second-string-field',
			valueType: 'string',
		},
	],
	restrictions: {
		foreignKey: [
			{
				schema: schemaAllDataTypes.name,
				mappings: [{ foreign: 'any-string', local: 'second-string-field' }],
			},
		],
	},
} as const satisfies Schema;

validateFixture(secondChildSchema, Schema, 'secondChildSchema is not a valid Schema');

export const dictionaryTwoChildSchemasOneForeignParent = {
	name: 'dictionary-two-child-schemas-one-foreign-parent',
	schemas: [schemaAllDataTypes, firstChildSchema, secondChildSchema],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionaryTwoChildSchemasOneForeignParent,
	Dictionary,
	'dictionaryTwoChildSchemasOneForeignParent is not a valid Dictionary',
);

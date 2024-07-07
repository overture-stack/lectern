import { Dictionary } from 'dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { schemaAllDataTypesRequired } from '../schema/schemaAllDataTypesRequired';

export const dictionarySingleSchemaRequiredRestrictions = {
	name: 'dictionary-all-fields-required',
	schemas: [schemaAllDataTypesRequired],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionarySingleSchemaRequiredRestrictions,
	Dictionary,
	'dictionarySingleSchemaRequiredRestrictions is not a valid Dictionary',
);

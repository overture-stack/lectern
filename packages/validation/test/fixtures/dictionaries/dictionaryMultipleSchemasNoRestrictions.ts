import { Dictionary } from 'dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { schemaSingleString } from '../schema/schemaSingleString';
import { schemaAllDataTypes } from '../schema/schemaAllDataTypes';

export const dictionaryMultipleSchemasNoRestrictions = {
	name: 'dictionary-multiple-no-restrictions',
	schemas: [schemaSingleString, schemaAllDataTypes],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionaryMultipleSchemasNoRestrictions,
	Dictionary,
	'dictionaryMultipleSchemasNoRestrictions is not a valid Dictionary',
);

import { Dictionary } from 'dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { schemaSingleString } from '../schema/schemaSingleString';

export const dictionarySingleSchemaNoRestrictions = {
	name: 'dictionary-single-string',
	schemas: [schemaSingleString],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionarySingleSchemaNoRestrictions,
	Dictionary,
	'dictionarySingleSchemaNoRestrictions is not a valid Dictionary',
);

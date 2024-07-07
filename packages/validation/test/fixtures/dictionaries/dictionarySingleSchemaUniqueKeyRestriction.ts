import { Dictionary } from 'dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { schemaUniqueKey } from '../schema/schemaUniqueKey';

export const dictionarySingleSchemaUniqueKeyRestriction = {
	name: 'dictionary-single-schema-unique-key',
	schemas: [schemaUniqueKey],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionarySingleSchemaUniqueKeyRestriction,
	Dictionary,
	'dictionarySingleSchemaUniqueKeyRestriction is not a valid Dictionary',
);

import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaAllTypesNoRestrictions } from './schemaAllTypesNoRestrictions';

export const dictionarySimple = {
	name: 'dictionary-simple',
	version: '1.0',
	displayName: 'Simple Example',
	description: 'A minimal example dictionary for basic demonstration and testing.',
	schemas: [schemaAllTypesNoRestrictions],
} as const satisfies Dictionary;

assertSchema(dictionarySimple, Dictionary, 'dictionarySimple is not a valid Dictionary');

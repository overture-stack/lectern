import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaWideEntity } from './schemaWideEntity';

export const dictionaryWideUniqueKey = {
	name: 'dictionary-wide-unique-key',
	version: '1.0',
	displayName: 'Wide Entity with Unique Key',
	description: 'An example dictionary for testing and demonstrating the uniqueKey constraint.',
	schemas: [schemaWideEntity],
} as const satisfies Dictionary;

assertSchema(dictionaryWideUniqueKey, Dictionary, 'dictionaryWideUniqueKey is not a valid Dictionary');

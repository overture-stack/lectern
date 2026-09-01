import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaWideConditional } from './schemaWideConditional';

export const dictionaryWideConditional = {
	name: 'dictionary-wide-conditional',
	version: '1.0',
	displayName: 'Wide Entity with Conditional Restrictions',
	description: 'An example dictionary for testing and demonstrating complex nested conditional field restrictions.',
	schemas: [schemaWideConditional],
} as const satisfies Dictionary;

assertSchema(dictionaryWideConditional, Dictionary, 'dictionaryWideConditional is not a valid Dictionary');

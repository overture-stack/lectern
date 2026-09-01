import { Dictionary } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaEntityA } from './schemaEntityA';
import { schemaEntityB } from './schemaEntityB';

export const dictionaryMultiRelationship = {
	name: 'dictionary-multi-relationship',
	version: '1.0',
	displayName: 'Multi-Entity Relationships',
	description: 'An example dictionary for testing and demonstrating foreign key relationships across multiple schemas.',
	schemas: [schemaEntityA, schemaEntityB],
} as const satisfies Dictionary;

assertSchema(dictionaryMultiRelationship, Dictionary, 'dictionaryMultiRelationship is not a valid Dictionary');

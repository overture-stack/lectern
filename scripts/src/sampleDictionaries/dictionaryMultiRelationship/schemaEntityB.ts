import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaEntityA } from './schemaEntityA';

export const schemaEntityB = {
	name: 'entity-b',
	description: 'Secondary entity. id is unique. entity_a_id is a foreign key to entity-a.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'entity_a_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'label', valueType: 'string' },
		{ name: 'rank', valueType: 'integer' },
		{ name: 'ratio', valueType: 'number' },
	],
	restrictions: {
		uniqueKey: ['id'],
		foreignKey: [
			{
				schema: schemaEntityA.name,
				mappings: [{ local: 'entity_a_id', foreign: 'id' }],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaEntityB, Schema, 'schemaEntityB is not a valid Schema');

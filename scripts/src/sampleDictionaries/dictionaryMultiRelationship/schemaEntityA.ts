import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaEntityA = {
	name: 'entity-a',
	description: 'Primary entity. id is unique. Other schemas may reference this schema via foreign key.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'name', valueType: 'string' },
		{ name: 'category', valueType: 'string' },
		{ name: 'count', valueType: 'integer' },
		{ name: 'score', valueType: 'number' },
	],
	restrictions: {
		uniqueKey: ['id'],
	},
} as const satisfies Schema;

assertSchema(schemaEntityA, Schema, 'schemaEntityA is not a valid Schema');

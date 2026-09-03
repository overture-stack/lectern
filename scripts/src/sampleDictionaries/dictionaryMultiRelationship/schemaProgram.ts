import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaProgram = {
	name: 'program',
	description: 'Root research program. id is unique. Other schemas may reference this schema via foreign key.',
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

assertSchema(schemaProgram, Schema, 'schemaProgram is not a valid Schema');

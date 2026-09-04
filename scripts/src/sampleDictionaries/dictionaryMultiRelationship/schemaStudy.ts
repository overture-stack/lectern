import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaProgram } from './schemaProgram';

export const schemaStudy = {
	name: 'study',
	description: 'Study within a program. id is unique. program_id is a foreign key to program.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'program_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'label', valueType: 'string' },
		{ name: 'rank', valueType: 'integer' },
		{ name: 'ratio', valueType: 'number' },
	],
	restrictions: {
		uniqueKey: ['id'],
		foreignKey: [
			{
				schema: schemaProgram.name,
				mappings: [{ local: 'program_id', foreign: 'id' }],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaStudy, Schema, 'schemaStudy is not a valid Schema');

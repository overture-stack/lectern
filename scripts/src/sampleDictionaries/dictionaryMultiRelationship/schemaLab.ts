import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaInstitution } from './schemaInstitution';

export const schemaLab = {
	name: 'lab',
	description: 'Lab within an institution. id is unique. institution_id is a foreign key to institution.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'institution_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'value', valueType: 'number' },
	],
	restrictions: {
		uniqueKey: ['id'],
		foreignKey: [
			{
				schema: schemaInstitution.name,
				mappings: [{ local: 'institution_id', foreign: 'id' }],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaLab, Schema, 'schemaLab is not a valid Schema');

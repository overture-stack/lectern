import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaInstitution } from './schemaInstitution';
import { schemaStudy } from './schemaStudy';

export const schemaEnrollment = {
	name: 'enrollment',
	description:
		'Enrollment record linking a study and an institution. Foreign keys reference two different parent schemas: study and institution.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'study_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'institution_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'note', valueType: 'string' },
	],
	restrictions: {
		uniqueKey: ['id'],
		foreignKey: [
			{
				schema: schemaStudy.name,
				mappings: [{ local: 'study_id', foreign: 'id' }],
			},
			{
				schema: schemaInstitution.name,
				mappings: [{ local: 'institution_id', foreign: 'id' }],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaEnrollment, Schema, 'schemaEnrollment is not a valid Schema');

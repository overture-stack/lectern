import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaStudy } from './schemaStudy';

export const schemaCohort = {
	name: 'cohort',
	description:
		'Cohort within a study. (id, group) is a composite unique key, enabling multi-field foreign key references from observation. study_id is a foreign key to study.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'group', valueType: 'string', restrictions: { required: true } },
		{ name: 'study_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'label', valueType: 'string' },
	],
	restrictions: {
		uniqueKey: ['id', 'group'],
		foreignKey: [
			{
				schema: schemaStudy.name,
				mappings: [{ local: 'study_id', foreign: 'id' }],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaCohort, Schema, 'schemaCohort is not a valid Schema');

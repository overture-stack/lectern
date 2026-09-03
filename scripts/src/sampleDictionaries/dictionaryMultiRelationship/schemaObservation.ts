import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';
import { schemaCohort } from './schemaCohort';

export const schemaObservation = {
	name: 'observation',
	description:
		'Observation within a cohort. Uses a multi-field foreign key to cohort, mapping (cohort_id, cohort_group) → (id, group).',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'cohort_id', valueType: 'string', restrictions: { required: true } },
		{ name: 'cohort_group', valueType: 'string', restrictions: { required: true } },
		{ name: 'value', valueType: 'number' },
	],
	restrictions: {
		uniqueKey: ['id'],
		foreignKey: [
			{
				schema: schemaCohort.name,
				mappings: [
					{ local: 'cohort_id', foreign: 'id' },
					{ local: 'cohort_group', foreign: 'group' },
				],
			},
		],
	},
} as const satisfies Schema;

assertSchema(schemaObservation, Schema, 'schemaObservation is not a valid Schema');

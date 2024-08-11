import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { fieldStringNoRestriction } from '../noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../../testUtils/validateFixture';
import { fieldNumberNoRestriction } from '../noRestrictions/fieldNumberNoRestriction';
import { fieldBooleanNoRestriction } from '../noRestrictions/fieldBooleanNoRestriction';

export const fieldStringConditionalMultipleConditions: SchemaField = {
	name: 'conditional-field',
	valueType: 'string',
	description:
		'Conditionally required or empty, based on the existence of `any-string`, `any-number`, and `any-boolean` fields.',
	restrictions: {
		if: {
			conditions: [
				{
					fields: [fieldStringNoRestriction.name],
					match: {
						exists: true,
					},
				},
				{
					fields: [fieldNumberNoRestriction.name],
					match: {
						exists: true,
					},
				},
				{
					fields: [fieldBooleanNoRestriction.name],
					match: {
						exists: true,
					},
				},
			],
		},
		then: {
			required: true,
		},
		else: {
			empty: true,
		},
	},
};

validateFixture(
	fieldStringConditionalMultipleConditions,
	SchemaField,
	'fieldStringConditionalMultipleConditions is not a valid SchemaField',
);

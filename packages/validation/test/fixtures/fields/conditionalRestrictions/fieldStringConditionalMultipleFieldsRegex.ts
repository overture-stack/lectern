import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../../testUtils/validateFixture';
import { regexAlphaOnly } from '../../restrictions/regexFixtures';

export const fieldStringConditionalMultipleFieldsRegex: SchemaField = {
	name: 'conditional-field',
	valueType: 'string',
	description:
		'Checks fields named `first`, `second`, and `third` are all alpha only, required if so, empty otherwise.',
	restrictions: {
		if: {
			conditions: [
				{
					fields: ['first', 'second', 'third'],
					match: {
						regex: regexAlphaOnly,
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
} satisfies SchemaStringField;

validateFixture(
	fieldStringConditionalMultipleFieldsRegex,
	SchemaField,
	'fieldStringConditionalMultipleFieldsRegex is not a valid SchemaField',
);

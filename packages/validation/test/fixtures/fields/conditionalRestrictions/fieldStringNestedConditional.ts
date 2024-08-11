import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { fieldStringNoRestriction } from '../noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../../testUtils/validateFixture';
import { regexAlphaOnly, regexRepeatedText } from '../../restrictions/regexFixtures';
import { fieldNumberNoRestriction } from '../noRestrictions/fieldNumberNoRestriction';
import { fieldBooleanNoRestriction } from '../noRestrictions/fieldBooleanNoRestriction';

export const fieldStringNestedConditional = {
	name: 'conditional-field',
	valueType: 'string',
	description:
		'Nested conditional restrictions. If `any-string` has repeated text, then two different conditions are tested, otherwise this should be empty. Nested condition 1: `any-number` has a value of 0 or greater, then we have the regex restriction alpha-only. Nested condition 2: `any-boolean` has the value `true`, then we have the `required` restriction.',
	restrictions: [
		{
			if: {
				conditions: [
					{
						fields: [fieldStringNoRestriction.name],
						match: {
							regex: regexRepeatedText,
						},
					},
				],
			},
			then: [
				{
					if: {
						conditions: [
							{
								fields: [fieldNumberNoRestriction.name],
								match: {
									range: { min: 0 },
								},
							},
						],
					},
					then: {
						regex: regexAlphaOnly,
					},
				},
				{
					if: {
						conditions: [
							{
								fields: [fieldBooleanNoRestriction.name],
								match: {
									value: true,
								},
							},
						],
					},
					then: {
						required: true,
					},
				},
			],
			else: {
				empty: true,
			},
		},
	],
} as const satisfies SchemaStringField;

validateFixture(fieldStringNestedConditional, SchemaField, 'fieldStringNestedConditional is not a valid SchemaField');

import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../../testUtils/validateFixture';
import { fieldNumberNoRestriction } from '../noRestrictions/fieldNumberNoRestriction';

export const fieldStringRequiredConditionalRange = {
	name: 'required-and-conditional-field',
	valueType: 'string',
	description: 'Required string, value must match a code list if `any-number` field has value 10 or greater.',
	restrictions: [
		{
			required: true,
		},
		{
			if: {
				conditions: [
					{
						fields: [fieldNumberNoRestriction.name],
						match: {
							range: { min: 10 },
						},
					},
				],
			},
			then: {
				codeList: ['big', 'large', 'huge'],
			},
		},
	],
} as const satisfies SchemaStringField;

validateFixture(
	fieldStringRequiredConditionalRange,
	SchemaField,
	'fieldStringRequiredConditionalRange is not a valid SchemaField',
);

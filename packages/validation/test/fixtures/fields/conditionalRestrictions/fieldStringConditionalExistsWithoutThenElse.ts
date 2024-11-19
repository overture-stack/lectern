import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { fieldStringNoRestriction } from '../noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../../testUtils/validateFixture';

export const fieldStringConditionalExistsWithouthThenElse = {
	name: 'conditional-field',
	valueType: 'string',
	description: 'Required if `fieldStringNoRestriction` field exists, otherwise must be empty',
	restrictions: {
		if: {
			conditions: [
				{
					fields: [fieldStringNoRestriction.name],
					match: {
						exists: true,
					},
				},
			],
		},
	},
} as const satisfies SchemaStringField;

validateFixture(
	fieldStringConditionalExistsWithouthThenElse,
	SchemaField,
	'fieldStringConditionalExistsWithouthThenElse is not a valid SchemaField',
);

import { SchemaField, type SchemaStringField } from '@overture-stack/lectern-dictionary';
import { fieldStringNoRestriction } from '../noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../../testUtils/validateFixture';

export const fieldStringConditionalExists = {
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
		then: {
			required: true,
		},
		else: {
			empty: true,
		},
	},
} as const satisfies SchemaStringField;

validateFixture(fieldStringConditionalExists, SchemaField, 'fieldStringConditionalExists is not a valid SchemaField');

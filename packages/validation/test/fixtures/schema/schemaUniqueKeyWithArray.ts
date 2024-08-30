import { Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { fieldBooleanNoRestriction } from '../fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerNoRestriction } from '../fields/noRestrictions/fieldIntegerNoRestriction';
import { fieldNumberNoRestriction } from '../fields/noRestrictions/fieldNumberNoRestriction';
import { fieldStringArrayNoRestriction } from '../fields/noRestrictions/fieldStringArrayNoRestriction';

const fields = [
	fieldStringArrayNoRestriction,
	fieldNumberNoRestriction,
	fieldIntegerNoRestriction,
	fieldBooleanNoRestriction,
];

const uniqueKey = fields.map((field) => field.name);

export const schemaUniqueKeyWithArray = {
	name: 'unique-key',
	description:
		'Contains a field of each possible data type with a schema restriction that the combined value must be unique. All fields are optional with no other restrictions.',
	fields,
	restrictions: {
		uniqueKey,
	},
} as const satisfies Schema;

validateFixture(schemaUniqueKeyWithArray, Schema, 'schemaUniqueKeyWithArray is not a valid Schema');

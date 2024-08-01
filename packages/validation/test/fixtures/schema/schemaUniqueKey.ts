import { Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../testUtils/validateFixture';
import { fieldBooleanNoRestriction } from '../fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerNoRestriction } from '../fields/noRestrictions/fieldIntegerNoRestriction';
import { fieldNumberNoRestriction } from '../fields/noRestrictions/fieldNumberNoRestriction';
import { fieldStringNoRestriction } from '../fields/noRestrictions/fieldStringNoRestriction';

const fields = [
	fieldStringNoRestriction,
	fieldNumberNoRestriction,
	fieldIntegerNoRestriction,
	fieldBooleanNoRestriction,
];

const uniqueKey = fields.map((field) => field.name);

export const schemaUniqueKey = {
	name: 'unique-key',
	description:
		'Contains a field of each possible data type with a schema restriction that the combined value must be unique. All fields are optional with no other restrictions.',
	fields,
	restrictions: {
		uniqueKey,
	},
} as const satisfies Schema;

validateFixture(schemaUniqueKey, Schema, 'schemaUniqueKey is not a valid Schema');

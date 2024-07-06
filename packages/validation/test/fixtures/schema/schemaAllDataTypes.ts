import { Schema } from 'dictionary';
import { fieldBooleanNoRestriction } from '../fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerNoRestriction } from '../fields/noRestrictions/fieldIntegerNoRestriction';
import { fieldNumberNoRestriction } from '../fields/noRestrictions/fieldNumberNoRestriction';
import { fieldStringNoRestriction } from '../fields/noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaAllDataTypes = {
	name: 'all-data-types',
	description: 'Contains a field of each possible data type. All optional, no restrictions.',
	fields: [fieldStringNoRestriction, fieldNumberNoRestriction, fieldIntegerNoRestriction, fieldBooleanNoRestriction],
} as const satisfies Schema;

validateFixture(schemaAllDataTypes, Schema, 'schemaAllDataTypes is not a valid schema.');

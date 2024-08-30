import { Schema } from '@overture-stack/lectern-dictionary';
import { fieldBooleanRequired } from '../fields/simpleRestrictions/boolean/fieldBooleanRequired';
import { fieldIntegerRequired } from '../fields/simpleRestrictions/integer/fieldIntegerRequired';
import { fieldNumberRequired } from '../fields/simpleRestrictions/number/fieldNumberRequired';
import { fieldStringRequired } from '../fields/simpleRestrictions/string/fieldStringRequired';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaAllDataTypesRequired = {
	name: 'all-data-types-required',
	description: 'Contains a field of each possible data type. All fields are required.',
	fields: [fieldStringRequired, fieldNumberRequired, fieldIntegerRequired, fieldBooleanRequired],
} as const satisfies Schema;

validateFixture(schemaAllDataTypesRequired, Schema, 'schemaAllDataTypesRequired is not a valid Schema');

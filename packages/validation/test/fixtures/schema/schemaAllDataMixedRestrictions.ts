import { Schema } from 'dictionary';
import { fieldStringManyRestrictions } from '../fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldBooleanNoRestriction } from '../fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerRequired } from '../fields/simpleRestrictions/integer/fieldIntegerRequired';
import { fieldNumberArrayCodeList } from '../fields/simpleRestrictions/number/fieldNumberArrayCodeList';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaAllDataTypesMixedRestrictions = {
	name: 'all-data-types-mixed-restrictions',
	fields: [fieldStringManyRestrictions, fieldNumberArrayCodeList, fieldIntegerRequired, fieldBooleanNoRestriction],
} as const satisfies Schema;

validateFixture(
	schemaAllDataTypesMixedRestrictions,
	Schema,
	'schemaAllDataTypesMixedRestrictions is not a valid schema.',
);

import type { Schema } from 'dictionary';
import { fieldStringManyRestrictions } from '../fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldBooleanNoRestriction } from '../fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerRequired } from '../fields/simpleRestrictions/integer/fieldIntegerRequired';
import { fieldNumberArrayCodeList } from '../fields/simpleRestrictions/number/fieldNumberArrayCodeList';

export const schemaAllDataTypesMixedRestrictions = {
	name: 'all-data-types-mixed-restrictions',
	fields: [fieldStringManyRestrictions, fieldNumberArrayCodeList, fieldIntegerRequired, fieldBooleanNoRestriction],
} as const satisfies Schema;

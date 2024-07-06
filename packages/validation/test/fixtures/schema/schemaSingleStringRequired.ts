import { Schema } from 'dictionary';
import { fieldStringRequired } from '../fields/simpleRestrictions/string/fieldStringRequired';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaSingleStringRequired = {
	name: 'single-string-required',
	description: 'Contains a single, optional string field.',
	fields: [fieldStringRequired],
} as const satisfies Schema;

validateFixture(schemaSingleStringRequired, Schema, 'schemaSingleStringRequired is not a valid schema.');

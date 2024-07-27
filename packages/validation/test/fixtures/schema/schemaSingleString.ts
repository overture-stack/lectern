import { Schema } from 'dictionary';
import { fieldStringNoRestriction } from '../fields/noRestrictions/fieldStringNoRestriction';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaSingleString = {
	name: 'single-string',
	description: 'Contains a single, optional string field.',
	fields: [fieldStringNoRestriction],
} as const satisfies Schema;

validateFixture(schemaSingleString, Schema, 'schemaSingleString is not a valid Schema');

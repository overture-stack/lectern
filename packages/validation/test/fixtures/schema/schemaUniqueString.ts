import { Schema } from '@overture-stack/lectern-dictionary';
import { fieldStringUnique } from '../fields/schemaRestrictions/fieldStringUnique';
import assert from 'node:assert';
import { validateFixture } from '../../testUtils/validateFixture';

export const schemaUniqueString = {
	name: 'single-unique-string',
	description: 'Contains a single string field where every value must be unique.',
	fields: [fieldStringUnique],
} as const satisfies Schema;

validateFixture(schemaUniqueString, Schema, 'schemaUniqueString is not a valid Schema');

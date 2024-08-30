import { Schema } from '@overture-stack/lectern-dictionary';
import { fieldStringUnique } from '../fields/schemaRestrictions/fieldStringUnique';
import assert from 'node:assert';
import { validateFixture } from '../../testUtils/validateFixture';
import { fieldStringUniqueArray } from '../fields/schemaRestrictions/fieldStringUniqueArray';

export const schemaUniqueStringArray = {
	name: 'single-unique-string-array',
	description: 'Contains a single string field where every value must be unique.',
	fields: [fieldStringUniqueArray],
} as const satisfies Schema;

validateFixture(schemaUniqueStringArray, Schema, 'schemaUniqueStringArray is not a valid Schema');

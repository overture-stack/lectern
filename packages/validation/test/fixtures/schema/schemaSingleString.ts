import type { Schema } from 'dictionary';
import { fieldStringNoRestriction } from '../fields/noRestrictions/fieldStringNoRestriction';

export const schemaSingleString = {
	name: 'single-string',
	description: 'Contains a single, optional string field.',
	fields: [fieldStringNoRestriction],
} as const satisfies Schema;

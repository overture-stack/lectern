import type { Schema } from 'dictionary';
import { fieldStringRequired } from '../fields/simpleRestrictions/string/fieldStringRequired';

export const schemaSingleStringRequired = {
	name: 'single-string-required',
	description: 'Contains a single, optional string field.',
	fields: [fieldStringRequired],
} as const satisfies Schema;

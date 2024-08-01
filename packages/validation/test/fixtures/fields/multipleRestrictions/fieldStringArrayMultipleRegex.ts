import type { SchemaStringField } from '@overture-stack/lectern-dictionary';
import { regexAlphaOnly, regexRepeatedText } from '../../restrictions/regexFixtures';

/**
 * Example field using an array of multiple restriction objects.
 */
export const fieldStringArrayMultipleRegex = {
	name: 'array-multiple-regex-rules',
	valueType: 'string',
	description: 'String field that must pass multiple regex tests',
	meta: {
		examples: ['hello', 'byebye', 'thisandthat'],
	},
	restrictions: [
		{
			regex: regexRepeatedText,
		},
		{
			regex: regexAlphaOnly,
		},
	],
} as const satisfies SchemaStringField;

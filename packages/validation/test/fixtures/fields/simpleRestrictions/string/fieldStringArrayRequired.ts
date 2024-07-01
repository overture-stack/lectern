import type { SchemaStringField } from 'dictionary';
import { regexYearMonthDay } from '../../../restrictions/regexFixtures';

export const fieldStringArrayRequired: SchemaStringField = {
	name: 'required-string-list',
	isArray: true,
	valueType: 'string',
	description: 'Required field. An array with at lest one string.',
	restrictions: {
		required: true,
	},
};

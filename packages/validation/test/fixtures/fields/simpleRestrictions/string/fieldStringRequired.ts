import type { SchemaStringField } from 'dictionary';
import { regexYearMonthDay } from '../../../restrictions/regexFixtures';

export const fieldStringRequired: SchemaStringField = {
	name: 'required-string',
	valueType: 'string',
	description: 'Required field. Any string value.',
	restrictions: {
		required: true,
	},
};

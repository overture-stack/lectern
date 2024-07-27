import type { SchemaStringField } from 'dictionary';
import { regexYearMonthDay } from '../../../restrictions/regexFixtures';

export const fieldStringRegex = {
	name: 'notable-date',
	valueType: 'string',
	description: 'Optional field. Values must be a date in the form YYYY-MM-DD.',
	meta: {
		examples: ['1867-07-01', '1969-07-16', '1989-12-17'],
	},
	restrictions: {
		regex: regexYearMonthDay,
	},
} as const satisfies SchemaStringField;

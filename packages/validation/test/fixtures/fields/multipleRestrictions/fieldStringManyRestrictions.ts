import type { SchemaField, SchemaStringField } from 'dictionary';
import { regexYearMonthDay } from '../../restrictions/regexFixtures';

export const fieldStringManyRestrictions: SchemaStringField = {
	name: 'complicated-multi-restriction-rules',
	valueType: 'string',
	description:
		'Designed to test scenario where a field has multiple restrictions. There may not be a practical use case for a field with this combination of restrictions, in particular having codeList and regex combined, but it is still important to test that such a combination does work.',
	meta: {
		examples: ['2001-01-01', '2002-02-02', '2003-03-03'],
	},
	restrictions: {
		codeList: ['2001-01-01', '2002-02-02', '2003-03-03', 'April 4, 2004', 'May-5-2005', '06/06/2006'],
		regex: regexYearMonthDay,
		required: true,
	},
};

import type { SchemaField, SchemaStringField } from 'dictionary';
import { codeListString } from '../../../restrictions/codeListsFixtures';

export const fieldStringCodeList: SchemaStringField = {
	name: 'favorite-food',
	valueType: 'string',
	description: 'Optional field. Values must be from the food code list (apple, banana, carrot, donut).',
	restrictions: {
		codeList: codeListString,
	},
};

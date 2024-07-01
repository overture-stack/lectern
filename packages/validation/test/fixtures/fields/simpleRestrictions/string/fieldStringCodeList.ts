import type { SchemaStringField } from 'dictionary';
import { codeListString } from '../../../restrictions/codeListsFixtures';

export const fieldStringCodeList = {
	name: 'favorite-food',
	valueType: 'string',
	description: 'Optional field. Values must be from the food code list (apple, banana, carrot, donut).',
	restrictions: {
		codeList: codeListString,
	},
} as const satisfies SchemaStringField;

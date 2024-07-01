import type { SchemaNumberField } from 'dictionary';
import { codeListNumber } from '../../../restrictions/codeListsFixtures';

export const fieldNumberArrayCodeList: SchemaNumberField = {
	name: 'metallic-ratios',
	isArray: true,
	valueType: 'number',
	description: 'Optional field. Values must be from the numeric code list of the first 4 metallic ratios.',
	restrictions: {
		codeList: codeListNumber,
	},
};

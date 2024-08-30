import type { SchemaNumberField } from '@overture-stack/lectern-dictionary';
import { codeListNumber } from '../../../restrictions/codeListsFixtures';

export const fieldNumberArrayCodeList = {
	name: 'number-code-list',
	isArray: true,
	valueType: 'number',
	description: 'Optional field. Values must be from the numeric code list of the first 4 metallic ratios.',
	restrictions: {
		codeList: codeListNumber,
	},
} as const satisfies SchemaNumberField;

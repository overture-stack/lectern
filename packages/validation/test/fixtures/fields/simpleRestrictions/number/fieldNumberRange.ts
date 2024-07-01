import type { SchemaNumberField } from 'dictionary';
import { rangePercent } from '../../../restrictions/rangeFixtures';

export const fieldNumberRange: SchemaNumberField = {
	name: 'percentage',
	valueType: 'number',
	description: 'Optional field. If a value is given it must be a percentage from 0-100',
	restrictions: {
		range: rangePercent,
	},
};

import type { SchemaNumberField } from '@overture-stack/lectern-dictionary';
import { rangePercent } from '../../../restrictions/rangeFixtures';

export const fieldNumberRange = {
	name: 'percentage',
	valueType: 'number',
	description: 'Optional field. If a value is given it must be a percentage from 0-100',
	restrictions: {
		range: rangePercent,
	},
} as const satisfies SchemaNumberField;

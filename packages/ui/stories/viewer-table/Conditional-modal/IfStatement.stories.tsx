/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import { IfStatement } from '../../../src/viewer-table/ConditionalLogicModal/IfStatement';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: IfStatement,
	title: 'Viewer Table/Conditional Modal/If Statement',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof IfStatement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFieldValueAll: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const SingleFieldValueAny: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'any',
				},
			],
			case: 'all',
		},
	},
};

export const SingleFieldValueNone: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'disabled' },
					case: 'none',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleFieldsValueAll: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['field_a', 'field_b', 'field_c'],
					match: { value: 'test' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CodeListMatch: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['type'],
					match: { codeList: ['premium', 'standard', 'basic'] },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const RegexMatch: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['identifier'],
					match: { regex: '^NCIT:C\\d+$' },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const RangeMatchMinMax: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['age'],
					match: { range: { min: 18, max: 65 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const ExistsTrue: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['optional_field'],
					match: { exists: true },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CountExact: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['tags'],
					match: { count: 3 },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CountRange: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['categories'],
					match: { count: { min: 1, max: 5 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const CodeListWithCountRestrictions: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['items'],
					match: { count: { max: 10 }, codeList: ['hello world', 'bye world'] },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleConditionsAll: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
				{
					fields: ['age'],
					match: { range: { min: 18 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

export const MultipleConditionsAny: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'premium' },
					case: 'all',
				},
				{
					fields: ['score'],
					match: { range: { min: 80 } },
					case: 'all',
				},
			],
			case: 'any',
		},
	},
};

export const AllMatchTypes: Story = {
	args: {
		ifStatement: {
			conditions: [
				{
					fields: ['status'],
					match: { value: 'active' },
					case: 'all',
				},
				{
					fields: ['type'],
					match: { codeList: ['premium', 'standard'] },
					case: 'all',
				},
				{
					fields: ['identifier'],
					match: { regex: '^NCIT:C\\d+$' },
					case: 'all',
				},
				{
					fields: ['age'],
					match: { range: { min: 18, max: 65 } },
					case: 'all',
				},
				{
					fields: ['optional_field'],
					match: { exists: true },
					case: 'all',
				},
				{
					fields: ['tags'],
					match: { count: { min: 1, max: 5 } },
					case: 'all',
				},
			],
			case: 'all',
		},
	},
};

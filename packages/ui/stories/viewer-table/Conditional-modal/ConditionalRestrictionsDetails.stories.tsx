/** @jsxImportSource @emotion/react */

import { ArrayTestCase, RestrictionCondition } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { ConditionalRestrictionDetails } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalRestrictionDetails';
import themeDecorator from '../../themeDecorator';

type RenderingConditionLogicContainerProps = {
	conditions: RestrictionCondition[];
	matchCase: ArrayTestCase;
};

const RenderingConditionLogicContainer = ({ conditions, matchCase }: RenderingConditionLogicContainerProps) => {
	return <div style={{ padding: '16px' }}>{ConditionalRestrictionDetails(conditions, matchCase)}</div>;
};

const meta = {
	component: RenderingConditionLogicContainer,
	title: 'Viewer - Table/Conditional Modal/Rendering Condition Logic',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof RenderingConditionLogicContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFieldValueAll: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'active' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const SingleFieldValueAny: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'active' },
				case: 'any',
			},
		],
		matchCase: 'all',
	},
};

export const SingleFieldValueNone: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'disabled' },
				case: 'none',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueAll: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b', 'field_c'],
				match: { value: 'test' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueAny: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b'],
				match: { value: 'test' },
				case: 'any',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleFieldsValueNone: Story = {
	args: {
		conditions: [
			{
				fields: ['field_a', 'field_b'],
				match: { value: 'test' },
				case: 'none',
			},
		],
		matchCase: 'all',
	},
};

export const CodeListMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['type'],
				match: { codeList: ['premium', 'standard', 'basic'] },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RegexMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['identifier'],
				match: { regex: '^NCIT:C\\d+$' },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RegexArrayMatch: Story = {
	args: {
		conditions: [
			{
				fields: ['code'],
				match: { regex: ['^A\\d+$', '^B\\d+$'] },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchMinMax: Story = {
	args: {
		conditions: [
			{
				fields: ['age'],
				match: { range: { min: 18, max: 65 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchExclusiveMax: Story = {
	args: {
		conditions: [
			{
				fields: ['score'],
				match: { range: { min: 0, exclusiveMax: 100 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const RangeMatchExclusiveMin: Story = {
	args: {
		conditions: [
			{
				fields: ['score'],
				match: { range: { exclusiveMin: 0, max: 100 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const ExistsTrue: Story = {
	args: {
		conditions: [
			{
				fields: ['optional_field'],
				match: { exists: true },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const ExistsFalse: Story = {
	args: {
		conditions: [
			{
				fields: ['optional_field'],
				match: { exists: false },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountExact: Story = {
	args: {
		conditions: [
			{
				fields: ['tags'],
				match: { count: 3 },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountRange: Story = {
	args: {
		conditions: [
			{
				fields: ['categories'],
				match: { count: { min: 1, max: 5 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const CountExclusiveMin: Story = {
	args: {
		conditions: [
			{
				fields: ['items'],
				match: { count: { exclusiveMin: 0 } },
				case: 'all',
			},
		],
		matchCase: 'all',
	},
};

export const MultipleConditionsAll: Story = {
	args: {
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
		matchCase: 'all',
	},
};

export const MultipleConditionsAny: Story = {
	args: {
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
		matchCase: 'any',
	},
};

export const MultipleConditionsNone: Story = {
	args: {
		conditions: [
			{
				fields: ['status'],
				match: { value: 'disabled' },
				case: 'all',
			},
			{
				fields: ['expired'],
				match: { exists: true },
				case: 'all',
			},
		],
		matchCase: 'none',
	},
};

export const AllMatchTypes: Story = {
	args: {
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
		matchCase: 'all',
	},
};

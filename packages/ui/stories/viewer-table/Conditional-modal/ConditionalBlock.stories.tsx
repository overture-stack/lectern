/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../../themeDecorator';
import { ConditionalBlock } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalBlock';

const meta = {
	component: ConditionalBlock,
	title: 'Viewer Table/Conditional Modal/ConditionalBlock',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ConditionalBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		conditionStatements: [
			{
				indentLevel: 0,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 1,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 2,
				Condition: <div>Hello World</div>,
			},
		],
	},
};

export const VariousIndentLevels: Story = {
	args: {
		conditionStatements: [
			{
				indentLevel: 0,
				Condition: <div>Level 0 - Hello World</div>,
			},
			{
				indentLevel: 0,
				Condition: <div>Level 0 - Hello World</div>,
			},
			{
				indentLevel: 1,
				Condition: <div>Level 1 - Hello World</div>,
			},
			{
				indentLevel: 2,
				Condition: <div>Level 2 - Hello World</div>,
			},
			{
				indentLevel: 3,
				Condition: <div>Level 3 - Hello World</div>,
			},
			{
				indentLevel: 1,
				Condition: <div>Level 1 - Hello World</div>,
			},
			{
				indentLevel: 0,
				Condition: <div>Level 0 - Hello World</div>,
			},
		],
	},
};

export const DeepNesting: Story = {
	args: {
		conditionStatements: [
			{
				indentLevel: 0,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 1,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 2,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 3,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 4,
				Condition: <div>Hello World</div>,
			},
			{
				indentLevel: 5,
				Condition: <div>Hello World</div>,
			},
		],
	},
};

export const Single: Story = {
	args: {
		conditionStatements: [
			{
				indentLevel: 0,
				Condition: <div>Hello World</div>,
			},
		],
	},
};

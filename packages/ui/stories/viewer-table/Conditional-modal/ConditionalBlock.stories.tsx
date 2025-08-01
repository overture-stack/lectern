/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import { ConditionalBlock } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalBlock';
import themeDecorator from '../../themeDecorator';

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
				Condition: <div>Hello World</div>,
			},
			{
				Condition: <div>Hello World</div>,
			},
			{
				Condition: <div>Hello World</div>,
			},
		],
	},
};

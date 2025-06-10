/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../themeDecorator';
import Accordion from '../../src/common/Accordion/Accordion';
const meta = {
	component: Accordion,
	title: 'Common/Accordion',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		accordionItems: [
			{ title: 'Item 1', description: 'Description for item 1', content: 'Content for item 1' },
			{ title: 'Item 2', description: 'Description for item 2', content: 'Content for item 2' },
			{ title: 'Item 3', description: 'Description for item 3', content: 'Content for item 3' },
		],
	},
};
export const Empty: Story = {
	args: { accordionItems: [] },
};

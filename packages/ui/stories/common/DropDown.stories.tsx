/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import Dropdown from '../../src/common/Dropdown/Dropdown';
import themeDecorator from '../themeDecorator';

const meta = {
	component: Dropdown,
	title: 'Common/Dropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Juice',
		leftIcon: '!',
		menuItems: [
			{
				label: 'Apple',
				action: () => {
					alert('apple juice!');
				},
			},
			{
				label: 'Orange',
				action: () => {
					alert('orange juice :(');
				},
			},
		],
	},
};

export const Disabled: Story = {
	args: {
		title: 'Juice',
		leftIcon: '!',
		disabled: true,
		menuItems: [
			{
				label: 'Apple',
				action: () => {
					alert('apple juice!');
				},
			},
			{
				label: 'Orange',
				action: () => {
					alert('orange juice :(');
				},
			},
		],
	},
};

export const Empty: Story = {
	args: {},
};

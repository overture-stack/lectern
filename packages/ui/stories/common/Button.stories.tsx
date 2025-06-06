/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../themeDecorator';
import Button from '../../src/common/Button';

const meta = {
	component: Button,
	title: 'Common/Button',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: 'Click Me', onClick: () => alert('I have been clicked'), className: 'my-button', leftIcon: '👍' },
};
export const Disabled: Story = {
	args: { children: 'Disabled', disabled: true },
};
export const Loading: Story = {
	args: { isLoading: true, children: 'Loading...' },
};
export const Empty: Story = {
	args: {},
};

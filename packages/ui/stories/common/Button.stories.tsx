/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../themeDecorator';
import Button from '../../src/common/Button';
import FileDownload from '../../src/theme/icons/FileDownload';

const meta = {
	component: Button,
	title: 'Common/Button',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: 'Click Me', onClick: () => alert('I have been clicked'), className: 'my-button', icon: '👍' },
};
export const Disabled: Story = {
	args: { children: 'Disabled', disabled: true },
};
export const Loading: Story = {
	args: { isLoading: true, children: 'Loading...' },
};
export const IconOnly: Story = {
	args: {
		icon: <FileDownload />,
		onClick: () => alert('I have been clicked'),
		className: 'iconButton',
		iconOnly: true,
	},
};
export const Empty: Story = {
	args: {},
};

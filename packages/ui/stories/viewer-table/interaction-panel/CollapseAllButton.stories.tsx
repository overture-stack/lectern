/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import CollapseAllButton from '../../../src/viewer-table/InteractionPanel/CollapseAllButton';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: CollapseAllButton,
	title: 'Viewer - Table/Interaction - Panel/CollapseAllButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof CollapseAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockOnClick = () => alert('All collapsible components are collapsed');

export const Default: Story = {
	args: { onClick: mockOnClick, disabled: false },
};

export const Disabled: Story = {
	args: {
		onClick: mockOnClick,
		disabled: true,
	},
};

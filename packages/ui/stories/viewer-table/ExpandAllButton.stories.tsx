/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../themeDecorator';
import ExpandAllButton from '../../src/viewer-table/InteractionPanel/ExpandAllButton';
const meta = {
	component: ExpandAllButton,
	title: 'Viewer - Table/ExpandAllButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ExpandAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { setIsCollapsed: (isCollapsed: boolean) => console.log('all collapsable components are expanded') },
};

/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../../themeDecorator';
import ExpandAllButton from '../../../src/viewer-table/InteractionPanel/ExpandAllButton';
const meta = {
	component: ExpandAllButton,
	title: 'Viewer - Table/Interaction - Panel/ExpandAllButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ExpandAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { onClick: () => alert('All collapsible components are expanded') },
};

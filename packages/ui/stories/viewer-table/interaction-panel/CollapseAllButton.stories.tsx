/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../../themeDecorator';
import CollapseAllButton from '../../../src/viewer-table/InteractionPanel/CollapseAllButton';

const meta = {
	component: CollapseAllButton,
	title: 'Viewer - Table/Interaction - Panel/CollapseAllButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof CollapseAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { onClick: () => alert('All collapsible components are collapsed') },
};

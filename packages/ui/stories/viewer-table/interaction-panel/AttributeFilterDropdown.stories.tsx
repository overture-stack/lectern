/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import AttributeFilter from '../../../src/viewer-table/InteractionPanel/AttributeFilterDropdown';
import themeDecorator from '../../themeDecorator';
const meta = {
	component: AttributeFilter,
	title: 'Viewer - Table/Interaction - Panel/AttributeFilterDropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof AttributeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		filters: [],
		setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
	},
};
export const Disabled: Story = {
	args: {
		filters: [],
		setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
		disabled: true,
	},
};

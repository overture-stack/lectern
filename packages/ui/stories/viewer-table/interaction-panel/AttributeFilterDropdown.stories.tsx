/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import AttributeFilter from '../../../src/viewer-table/InteractionPanel/AttributeFilterDropdown';
import themeDecorator from '../../themeDecorator';
import AdvancedDictionary from '../../fixtures/advanced.json';
import { Dictionary } from '@overture-stack/lectern-dictionary';
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
		data: AdvancedDictionary as Dictionary,
		isFiltered: false,
		setFilteredData: () => {},
		setIsFiltered: () => {},
	},
};

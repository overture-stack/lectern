/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import { Dictionary } from '@overture-stack/lectern-dictionary';
import InteractionPanel from '../../../src/viewer-table/InteractionPanel/InteractionPanel';
import themeDecorator from '../../themeDecorator';
import AdvancedDictionary from '../../../../../samples/dictionary/advanced.json';
import biosampleDictionary from '../../fixtures/minimalBiosampleModel';

const meta = {
	component: InteractionPanel,
	title: 'Viewer - Table/Interaction - Panel/InteractionPanel',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof InteractionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSetIsCollapsed = (isCollapsed: boolean) => {
	console.log('setIsCollapsed called with:', isCollapsed);
};

const mockSetFilteredData = (dict: Dictionary) => {
	console.log('setFilteredData called with dictionary:', dict.name);
};

const mockSetIsFiltered = (bool: boolean) => {
	console.log('setIsFiltered called with:', bool);
};

const mockOnAccordionToggle = (schemaName: string, isOpen: boolean) => {
	console.log('onAccordionToggle called for schema:', schemaName, 'isOpen:', isOpen);
};

export const Default: Story = {
	args: {
		schemas: (AdvancedDictionary as Dictionary).schemas,
		dictionary: AdvancedDictionary as Dictionary,
		filteredData: AdvancedDictionary as Dictionary,
		isFiltered: false,
		version: '1.0',
		name: 'advanced-dictionary',
		lecternUrl: 'http://localhost:3031',
		setIsCollapsed: mockSetIsCollapsed,
		setFilteredData: mockSetFilteredData,
		setIsFiltered: mockSetIsFiltered,
		onAccordionToggle: mockOnAccordionToggle,
	},
};

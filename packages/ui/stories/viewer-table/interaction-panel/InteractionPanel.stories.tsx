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

const SingleDictionaryData: Dictionary[] = [AdvancedDictionary as Dictionary];

const MultipleDictionaryData: Dictionary[] = [
	{ ...AdvancedDictionary, version: '1.0' } as Dictionary,
	{ ...AdvancedDictionary, version: '2.0' } as Dictionary,
	{ ...AdvancedDictionary, version: '3.0' } as Dictionary,
];

const mockSetIsCollapsed = (isCollapsed: boolean) => {
	console.log('setIsCollapsed called with:', isCollapsed);
};

const mockOnVersionChange = (index: number) => {
	console.log('onVersionChange called with index:', index);
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
export const Disabled: Story = {
	args: {
		schemas: (AdvancedDictionary as Dictionary).schemas,
		dictionary: AdvancedDictionary as Dictionary,
		filteredData: AdvancedDictionary as Dictionary,
		isFiltered: false,
		version: '1.0',
		name: 'advanced-dictionary',
		lecternUrl: 'http://localhost:3031',
		disabled: true,
		setIsCollapsed: mockSetIsCollapsed,
		setFilteredData: mockSetFilteredData,
		setIsFiltered: mockSetIsFiltered,
		onAccordionToggle: mockOnAccordionToggle,
	},
};

export const WithMultipleVersions: Story = {
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
		onVersionChange: mockOnVersionChange,
		dictionaryVersions: MultipleDictionaryData,
		currentVersionIndex: 0,
	},
};

export const WithSingleVersion: Story = {
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
		onVersionChange: mockOnVersionChange,
		dictionaryVersions: SingleDictionaryData,
		currentVersionIndex: 0,
	},
};

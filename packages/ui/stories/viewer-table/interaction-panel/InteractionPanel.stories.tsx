/** @jsxImportSource @emotion/react */

import { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterMapping } from '../../../src/viewer-table/InteractionPanel/AttributeFilterDropdown';
import { DictionaryConfig } from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';
import InteractionPanel from '../../../src/viewer-table/InteractionPanel/InteractionPanel';
import AdvancedDictionary from '../../fixtures/advanced.json';
import themeDecorator from '../../themeDecorator';

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
	alert('setIsCollapsed called with:' + isCollapsed);
};

const mockOnVersionChange = (index: number) => {
	alert('onVersionChange called with index:' + index);
};

export const Default: Story = {
	args: {
		setIsCollapsed: mockSetIsCollapsed,
		onSelect(schemaNameIndex) {
			alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
		},
		currDictionary: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: SingleDictionaryData,
			onVersionChange: mockOnVersionChange,
			filters: { active: true },
			setFilters: (filters: FilterMapping) => {
				alert('setFilters called with:' + filters);
			},
		} as DictionaryConfig,
		setFilters: (filters: FilterMapping) => {
			alert('setFilters called with:' + filters);
		},
	},
};
export const Disabled: Story = {
	args: {
		disabled: true,
		setIsCollapsed: mockSetIsCollapsed,
		onSelect(schemaNameIndex) {
			alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
		},
		currDictionary: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: SingleDictionaryData,
			onVersionChange: mockOnVersionChange,
			filters: { active: true },
			setFilters: (filters: FilterMapping) => {
				alert('setFilters called with:' + filters);
			},
		} as DictionaryConfig,
		setFilters: (filters: FilterMapping) => {
			alert('setFilters called with:' + filters);
		},
	},
};

export const WithMultipleVersions: Story = {
	args: {
		setIsCollapsed: mockSetIsCollapsed,
		onSelect(schemaNameIndex) {
			alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
		},
		currDictionary: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: MultipleDictionaryData,
			onVersionChange: mockOnVersionChange,
			filters: { active: true },
			setFilters: (filters: FilterMapping) => {
				alert('setFilters called with:' + filters);
			},
		} as DictionaryConfig,
		setFilters: (filters: FilterMapping) => {
			alert('setFilters called with:' + filters);
		},
	},
};

export const WithSingleVersion: Story = {
	args: {
		setIsCollapsed: mockSetIsCollapsed,
		onSelect(schemaNameIndex) {
			alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
		},
		currDictionary: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: SingleDictionaryData,
			onVersionChange: mockOnVersionChange,
			filters: { active: true },
			setFilters: (filters: FilterMapping) => {
				alert('setFilters called with:' + filters);
			},
		} as DictionaryConfig,
		setFilters: (filters: FilterMapping) => {
			alert('setFilters called with:' + filters);
		},
	},
};

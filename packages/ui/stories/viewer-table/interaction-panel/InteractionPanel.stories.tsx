/** @jsxImportSource @emotion/react */

import { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import type { FilterOptions } from '../../../src/viewer-table/InteractionPanel/AttributeFilterDropdown';
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

const mockProps = {
	setIsCollapsed: (isCollapsed: boolean) => {
		alert('setIsCollapsed called with:' + isCollapsed);
	},
	onSelect: (schemaNameIndex) => {
		alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
	},
	currDictionary: {
		lecternUrl: '',
		dictionaryIndex: 0,
		onVersionChange: (index: number) => {
			alert('onVersionChange called with index:' + index);
		},
		filters: [],
		setFilters: (filters: FilterOptions[]) => {
			alert('setFilters called with:' + filters);
		},
	},
};

// When we are at multiple versions, then the version switcher is now rendered, this is to test that behavior
export const Default: Story = {
	args: {
		...mockProps,
		currDictionary: {
			...mockProps.currDictionary,
			dictionaryData: MultipleDictionaryData,
		},
	},
};

// The reason why this story exists is to test the behavior when the dictionary version switcher button is not rendered
export const WithSingleVersion: Story = {
	args: {
		...mockProps,
		currDictionary: {
			...mockProps.currDictionary,
			dictionaryData: SingleDictionaryData,
		},
	},
};

export const Disabled: Story = {
	args: {
		...mockProps,
		currDictionary: {
			...mockProps.currDictionary,
			dictionaryData: MultipleDictionaryData,
		},
		disabled: true,
	},
};

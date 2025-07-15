/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import type { FilterOptions } from '../../../src/viewer-table/InteractionPanel/AttributeFilterDropdown';
import InteractionPanel from '../../../src/viewer-table/InteractionPanel/InteractionPanel';
import AdvancedDictionary from '../../fixtures/TorontoMapleLeafs.json';
import themeDecorator from '../../themeDecorator';

import { type DictionaryServerRecord } from '../../../../client/src/rest/getDictionary';

const storybookStyles = css`
	padding-bottom: 200px;
`;

const meta = {
	component: InteractionPanel,
	title: 'Viewer - Table/Interaction - Panel/InteractionPanel',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	render: (args) => <InteractionPanel {...args} />,
} satisfies Meta<typeof InteractionPanel>;

export default meta;

export type DictionaryServerUnion = Dictionary | DictionaryServerRecord;

type Story = StoryObj<typeof meta>;

const SingleDictionaryData: Array<DictionaryServerUnion> = [AdvancedDictionary as DictionaryServerUnion];

const MultipleDictionaryData: DictionaryServerUnion[] = [
	{ ...AdvancedDictionary, version: '1.0', createdAt: '2025-20-20' } as DictionaryServerRecord,
	{ ...AdvancedDictionary, version: '2.0', createdAt: '2025-20-20' } as DictionaryServerRecord,
	{ ...AdvancedDictionary, version: '3.0', createdAt: '2025-20-20' } as DictionaryServerRecord,
];

const mockProps = {
	setIsCollapsed: (isCollapsed: boolean) => {
		alert('setIsCollapsed called with:' + isCollapsed);
	},
	onSelect: (schemaNameIndex) => {
		alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
	},
	dictionaryConfig: {
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
		dictionaryConfig: {
			...mockProps.dictionaryConfig,
			dictionaryData: MultipleDictionaryData,
		},
		styles: storybookStyles,
	},
};

// The reason why this story exists is to test the behavior when the dictionary version switcher button is not rendered
export const WithSingleVersion: Story = {
	args: {
		...mockProps,
		dictionaryConfig: {
			...mockProps.dictionaryConfig,
			dictionaryData: SingleDictionaryData,
		},
	},
};

export const Disabled: Story = {
	args: {
		...mockProps,
		dictionaryConfig: {
			...mockProps.dictionaryConfig,
			dictionaryData: MultipleDictionaryData,
		},
		disabled: true,
	},
};

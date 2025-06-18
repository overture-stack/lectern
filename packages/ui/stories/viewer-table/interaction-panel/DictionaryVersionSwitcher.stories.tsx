/** @jsxImportSource @emotion/react */

import { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import VersionSwitcher from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';
import DictionarySample from '../../fixtures/advanced.json';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: VersionSwitcher,
	title: 'Viewer - Table/Interaction - Panel/Dictionary Version Switcher',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof VersionSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create multiple dictionary versions for testing
const SingleDictionaryData: Dictionary[] = [DictionarySample as Dictionary];

const MultipleDictionaryData: Dictionary[] = [
	{ ...DictionarySample, version: '1.0' } as Dictionary,
	{ ...DictionarySample, version: '2.0' } as Dictionary,
	{ ...DictionarySample, version: '3.0' } as Dictionary,
];

export const MultipleVersions: Story = {
	args: {
		config: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: MultipleDictionaryData,
			onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
			filters: { active: true },
			setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
		},
	},
};
export const SingleVersion: Story = {
	args: {
		config: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: SingleDictionaryData,
			onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
			filters: { active: true },
			setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
		},
	},
};

export const EmptyArray: Story = {
	args: {
		config: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: [],
			onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
			filters: { active: true },
			setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
		},
	},
};
export const DisabledWithMultipleVersions: Story = {
	args: {
		config: {
			lecternUrl: 'http://localhost:3031',
			dictionaryIndex: 0,
			dictionaryData: MultipleDictionaryData,
			onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
			filters: { active: true },
			setFilters: (filters) => alert(`Filters updated: ${JSON.stringify(filters)}`),
		},
		disabled: true,
	},
};

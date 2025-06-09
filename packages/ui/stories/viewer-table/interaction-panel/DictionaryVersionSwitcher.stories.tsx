/** @jsxImportSource @emotion/react */

import { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import DictionarySample from '../../../../../samples/dictionary/advanced.json';
import VersionSwitcher from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';
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
		dictionaryData: MultipleDictionaryData,
		onVersionChange: (index: number) => console.log(`Version changed to index: ${index}`),
		dictionaryIndex: 0,
	},
};
export const SingleVersion: Story = {
	args: {
		dictionaryData: SingleDictionaryData,
		onVersionChange: (index: number) => console.log(`Version changed to index: ${index}`),
		dictionaryIndex: 0,
	},
};

export const EmptyArray: Story = {
	args: {
		dictionaryData: [],
		onVersionChange: (index: number) => console.log(`Version changed to index: ${index}`),
		dictionaryIndex: 0,
	},
};

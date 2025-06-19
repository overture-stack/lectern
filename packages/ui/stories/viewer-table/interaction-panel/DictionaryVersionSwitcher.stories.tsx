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

const SingleDictionaryData: Dictionary[] = [DictionarySample as Dictionary];
const MultipleDictionaryData: Dictionary[] = [
	{ ...DictionarySample, version: '1.0' } as Dictionary,
	{ ...DictionarySample, version: '2.0' } as Dictionary,
	{ ...DictionarySample, version: '3.0' } as Dictionary,
];

const mockProps = {
	dictionaryData: MultipleDictionaryData,
	dictionaryIndex: 0,
	onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
};

export const MultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
	},
};

export const SingleVersion: Story = {
	args: {
		...mockProps,
		dictionaryData: SingleDictionaryData,
	},
};

export const EmptyArray: Story = {
	args: {
		...mockProps,
		dictionaryData: [],
	},
};

export const DisabledWithMultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
		disabled: true,
	},
};

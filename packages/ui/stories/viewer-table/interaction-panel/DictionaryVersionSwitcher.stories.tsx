/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import VersionSwitcher, {
	DictionaryServerUnion,
} from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';
import DictionarySample from '../../fixtures/TorontoMapleLeafs.json';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: VersionSwitcher,
	title: 'Viewer - Table/Interaction - Panel/Dictionary Version Switcher',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof VersionSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const SingleDictionaryData: DictionaryServerUnion[] = [DictionarySample as DictionaryServerUnion];
const MultipleDictionaryData: DictionaryServerUnion[] = [
	{ ...DictionarySample, version: '1.0', _id: '1', createdAt: '2025-20-20' } as DictionaryServerUnion,
	{ ...DictionarySample, version: '2.0', _id: '2', createdAt: '2025-20-20' } as DictionaryServerUnion,
	{ ...DictionarySample, version: '3.0', _id: '3', createdAt: '2025-20-20' } as DictionaryServerUnion,
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
		title: 'Version Switcher',
	},
};

export const SingleVersion: Story = {
	args: {
		...mockProps,
		dictionaryData: SingleDictionaryData,
		title: 'Version Switcher',
	},
};

export const EmptyArray: Story = {
	args: {
		...mockProps,
		dictionaryData: [],
		title: 'Version Switcher',
	},
};

export const DisabledWithMultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
		disabled: true,
		title: 'Version Switcher',
	},
};

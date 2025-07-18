/** @jsxImportSource @emotion/react */

import { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import VersionSwitcher, {
	DictionaryServerUnion,
} from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';
import DictionarySample from '../../fixtures/pcgl.json';
import themeDecorator from '../../themeDecorator';
import { DictionaryServerRecord } from '../../../../client/src/rest/getDictionary';

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
	{ ...DictionarySample, _id: '1', version: '1.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
	{ ...DictionarySample, _id: '2', version: '2.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
	{ ...DictionarySample, _id: '3', version: '3.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
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
		title: 'Multiple Versions',
	},
};

export const SingleVersion: Story = {
	args: {
		...mockProps,
		dictionaryData: SingleDictionaryData,
		title: 'Single Version',
	},
};

export const EmptyArray: Story = {
	args: {
		...mockProps,
		dictionaryData: [],
		title: 'Empty Array',
	},
};

export const DisabledWithMultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
		disabled: true,
		title: 'Disabled with Multiple Versions',
	},
};

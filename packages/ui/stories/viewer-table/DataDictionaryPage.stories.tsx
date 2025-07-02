/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import DataDictionaryPage from '../../src/viewer-table/DataDictionaryPage';
import PCGL from '../fixtures/pcgl.json';
import Advanced from '../fixtures/TorontoMapleLeafs.json';
import themeDecorator from '../themeDecorator';

const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);
const advancedDictionary: Dictionary = replaceReferences(Advanced as Dictionary);

const meta = {
	component: DataDictionaryPage,
	title: 'Viewer - Table/Data Dictionary Page',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DataDictionaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PCGLDictionary: Story = {
	args: {
		dictionaries: [pcglDictionary],
		dictionaryIndex: 0,
		lecternUrl: 'localhost:3031',
		onVersionChange: (index: number) => {
			console.log('Version changed to index:', index);
		},
	},
};

export const MultipleVersions: Story = {
	args: {
		dictionaries: [
			{ ...pcglDictionary, version: '1.0', name: `${pcglDictionary.name} v1.0` },
			{ ...pcglDictionary, version: '1.1', name: `${pcglDictionary.name} v1.1` },
			{ ...pcglDictionary, version: '2.0', name: `${pcglDictionary.name} v2.0` },
			{ ...pcglDictionary, version: '2.1', name: `${pcglDictionary.name} v2.1` },
			{ ...pcglDictionary, version: '3.0', name: `${pcglDictionary.name} v3.0` },
		],
		dictionaryIndex: 2,
		lecternUrl: 'localhost:3031',
		onVersionChange: (index: number) => {
			console.log('Version changed to index:', index);
		},
	},
};

export const AdvancedDictionary: Story = {
	args: {
		dictionaries: [
			{ ...advancedDictionary, version: '1.0', name: `${advancedDictionary.name} v1.0` },
			{ ...advancedDictionary, version: '1.5', name: `${advancedDictionary.name} v1.5` },
			{ ...advancedDictionary, version: '2.0', name: `${advancedDictionary.name} v2.0` },
		],
		dictionaryIndex: 1,
		lecternUrl: 'localhost:3031',
		onVersionChange: (index: number) => {
			console.log('Version changed to index:', index);
		},
	},
};

export const MixedDictionaries: Story = {
	args: {
		dictionaries: [
			{ ...pcglDictionary, version: '1.0' },
			{ ...advancedDictionary, version: '1.0' },
			{ ...pcglDictionary, version: '2.0' },
			{ ...advancedDictionary, version: '2.0' },
		],
		dictionaryIndex: 0,
		lecternUrl: 'localhost:3031',
		onVersionChange: (index: number) => {
			console.log('Version changed to index:', index);
		},
	},
};

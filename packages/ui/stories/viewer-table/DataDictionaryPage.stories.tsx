/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import DataDictionaryPage from '../../src/viewer-table/DataDictionaryPage';
import PCGL from '../fixtures/pcgl.json';
import Advanced from '../fixtures/TorontoMapleLeafs.json';
import themeDecorator from '../themeDecorator';

const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);
const advancedDictionary: Dictionary = replaceReferences(Advanced as Dictionary);

// Wrapper component to manage state for version switching
const DataDictionaryPageWrapper = ({
	dictionaries,
	initialDictionaryIndex = 0,
	lecternUrl = 'localhost:3031',
}: {
	dictionaries: Dictionary[];
	initialDictionaryIndex?: number;
	lecternUrl?: string;
}) => {
	const [dictionaryIndex, setDictionaryIndex] = useState(initialDictionaryIndex);

	const handleVersionChange = (index: number) => {
		console.log('Version changed to index:', index);
		setDictionaryIndex(index);
	};

	return (
		<DataDictionaryPage
			dictionaries={dictionaries}
			dictionaryIndex={dictionaryIndex}
			lecternUrl={lecternUrl}
			onVersionChange={handleVersionChange}
		/>
	);
};

const meta = {
	component: DataDictionaryPageWrapper,
	title: 'Viewer - Table/Data Dictionary Page',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DataDictionaryPageWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PCGLDictionary: Story = {
	args: {
		dictionaries: [pcglDictionary],
		initialDictionaryIndex: 0,
		lecternUrl: 'localhost:3031',
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
		initialDictionaryIndex: 2,
		lecternUrl: 'localhost:3031',
	},
};

export const AdvancedDictionary: Story = {
	args: {
		dictionaries: [
			{ ...advancedDictionary, version: '1.0', name: `${advancedDictionary.name} v1.0` },
			{ ...advancedDictionary, version: '1.5', name: `${advancedDictionary.name} v1.5` },
			{ ...advancedDictionary, version: '2.0', name: `${advancedDictionary.name} v2.0` },
		],
		initialDictionaryIndex: 1,
		lecternUrl: 'localhost:3031',
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
		initialDictionaryIndex: 0,
		lecternUrl: 'localhost:3031',
	},
};

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

// Using the primitiveJson as a mock schema for demonstration purposes
const DictionaryData: Dictionary[] = [DictionarySample as Dictionary];

export const Default: Story = {
	args: {
		dictionaryData: DictionaryData,
		onVersionChange: (index: number) => console.log(`Version changed to index: ${index}`),
		dictionaryIndex: 0,
	},
};

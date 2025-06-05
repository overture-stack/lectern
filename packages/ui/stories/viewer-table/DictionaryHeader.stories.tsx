/** @jsxImportSource @emotion/react */

// import { DictionaryHeader } from '#/viewer-table/DictionaryHeader';
import type { Meta, StoryObj } from '@storybook/react';
import { pick } from 'lodash';
import DictionaryHeader from '../../src/viewer-table/DictionaryHeader';
import biosampleDictionary from '../fixtures/minimalBiosampleModel';
import themeDecorator from '../themeDecorator';

const meta = {
	component: DictionaryHeader,
	title: 'Viewer - Table/Dictionary Header',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DictionaryHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllHeaderProperties: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { ...pick(biosampleDictionary, 'name', 'version', 'description') },
};

export const NoVersion: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { ...pick(biosampleDictionary, 'name', 'description') },
};
export const NoDescription: Story = {
	args: { ...pick(biosampleDictionary, 'name', 'version') },
};

export const LongName: Story = {
	args: {
		...pick(biosampleDictionary, 'name', 'version', 'description'),
		name: 'This is a really really reallt reallty long dictionary name! wow!',
	},
};
export const LongDescription: Story = {
	args: {
		...pick(biosampleDictionary, 'name', 'version', 'description'),
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	},
};

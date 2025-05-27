import { DictionaryHeader } from '#/viewer-table/DictionaryHeader';
import type { SchemaField } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { pick } from 'lodash';
import biosampleDictionary from '../fixtures/minimalBiosampleModel';

const sampleField: SchemaField = {
	name: 'hobbies',
	valueType: 'string',
	isArray: true,
	delimiter: '|',
	description: "List of user's favourite passtimes",
	restrictions: {},
};

const meta = {
	component: DictionaryHeader,
	title: 'Viewer - Table/Dictionary Header',
	tags: ['autodocs'],
} satisfies Meta<typeof DictionaryHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllHeaderProperties: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { ...pick(biosampleDictionary, 'name', 'version', 'description') },
};

export const NoDescription: Story = {
	args: { ...pick(biosampleDictionary, 'name', 'version') },
};

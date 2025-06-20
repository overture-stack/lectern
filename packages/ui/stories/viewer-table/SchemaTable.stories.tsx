/** @jsxImportSource @emotion/react */

// import { DictionaryHeader } from '#/viewer-table/DictionaryHeader';
import type { Meta, StoryObj } from '@storybook/react';
import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable';
import Advanced from '../fixtures/advanced.json';
import themeDecorator from '../themeDecorator';
import { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
const dictionary: Dictionary = Advanced as Dictionary;
const schema: Schema = dictionary.schemas[0];
const meta = {
	component: SchemaTable,
	title: 'Viewer - Table/Schema Table',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof SchemaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { schema, dictionary },
};

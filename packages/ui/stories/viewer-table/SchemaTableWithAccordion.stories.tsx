/** @jsxImportSource @emotion/react */

// import { DictionaryHeader } from '#/viewer-table/DictionaryHeader';
import type { Meta, StoryObj } from '@storybook/react';
import SchemaTableWithAccordion from '../../src/viewer-table/DataTable/SchemaTableWithAccordion';
import Dictionary from '../fixtures/minimalBiosampleModel';
import themeDecorator from '../themeDecorator';
import { Schema } from '@overture-stack/lectern-dictionary';
const schema: Schema = Dictionary.schemas[0];

const meta = {
	component: SchemaTableWithAccordion,
	title: 'Viewer - Table/Schema Table With Accordion',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof SchemaTableWithAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { schema },
};

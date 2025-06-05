/** @jsxImportSource @emotion/react */

import { Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import Dictionary from '../../../../samples/dictionary/advanced.json';
import TableOfContentsDropdown from '../../src/viewer-table/InteractionPanel/TableOfContentsDropdown';
import themeDecorator from '../themeDecorator';

const meta = {
	component: TableOfContentsDropdown,
	title: 'Viewer - Table/Table of Contents Dropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof TableOfContentsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// Using the primitiveJson as a mock schema for demonstration purposes
const schemas: Schema[] = Dictionary.schemas as Schema[];

// Mock functions for the story just to demonstrate interaction

const onAccordionToggle = (schemaName: string, isOpen: boolean) => {
	console.log('Accordion has been toggled for the following schema: ', schemaName);
};

export const Default: Story = {
	args: {
		schemas: schemas,
		onAccordionToggle,
	},
};

export const Empty: Story = {
	args: { schemas: [], onAccordionToggle },
};

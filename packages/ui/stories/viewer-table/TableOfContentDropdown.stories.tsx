/** @jsxImportSource @emotion/react */

import { Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import primitiveJson from '../../../../samples/schemas/primitives.json';
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
const schema: Schema = primitiveJson as Schema;

// Mock functions for the story just to demonstrate interaction

const onSchemaSelect = (schema: Schema) => {
	console.log('Selected schema:', schema);
};

const onAccordionToggle = (schemaName: string, isOpen: boolean) => {
	console.log(`Accordion ${isOpen ? 'opened' : 'closed'} for schema:`, schemaName);
};

export const Default: Story = {
	args: {
		schemas: [schema],
		onSchemaSelect,
		onAccordionToggle,
	},
};

export const Empty: Story = {
	args: { schemas: [], onSchemaSelect, onAccordionToggle },
};

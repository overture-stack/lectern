/** @jsxImportSource @emotion/react */

import { Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import Dictionary from '../../fixtures/advanced.json';
import TableOfContentsDropdown from '../../../src/viewer-table/InteractionPanel/TableOfContentsDropdown';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: TableOfContentsDropdown,
	title: 'Viewer - Table/Interaction - Panel/Table of Contents Dropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof TableOfContentsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// Using the primitiveJson as a mock schema for demonstration purposes
const schemas: Schema[] = Dictionary.schemas as Schema[];

// Mock functions for the story just to demonstrate interaction

const onAccordionToggle = (schemaIndex: number) => {
	alert(`Accordion has been toggled for the following schema: ${schemas[schemaIndex].name}`);
};

export const Default: Story = {
	args: {
		schemas: schemas,
		onSelect: onAccordionToggle,
	},
};

export const Empty: Story = {
	args: { schemas: [], onSelect: onAccordionToggle },
};

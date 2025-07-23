/** @jsxImportSource @emotion/react */

import { Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import TableOfContentsDropdown from '../../../src/viewer-table/InteractionPanel/TableOfContentsDropdown';
import Dictionary from '../../fixtures/pcgl.json';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: TableOfContentsDropdown,
	title: 'Viewer - Table/Interaction - Panel/Table of Contents Dropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof TableOfContentsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const schemas: Schema[] = Dictionary.schemas as Schema[];

const onSelect = (schemaIndex: number) => {
	alert(`Accordion has been toggled for the following schema: ${schemas[schemaIndex].name}`);
};

export const Default: Story = {
	args: {
		schemas: schemas,
		onSelect,
	},
};

export const Empty: Story = {
	args: { schemas: [], onSelect: () => {} },
};

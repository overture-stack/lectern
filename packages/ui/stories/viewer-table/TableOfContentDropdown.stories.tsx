/** @jsxImportSource @emotion/react */

import { Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import primitiveJson from '../../../../samples/schemas/primitives.json';
import TableOfContentsDropdown from '../../src/viewer-table/InteractionPanel/TableOfContentsDropdown';
import themeDecorator from '../themeDecorator';

// Using the primitiveJson as a mock schema for demonstration purposes

const schema: Schema = primitiveJson as Schema;

const meta = {
	component: TableOfContentsDropdown,
	title: 'Viewer - Table/Table of Contents Dropdown',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof TableOfContentsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		schemas: [schema],
	},
};

export const Empty: Story = {
	args: { schemas: [] },
};

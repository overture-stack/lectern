/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import { Dictionary } from '@overture-stack/lectern-dictionary';
import DataDictionaryPage from '../../src/viewer-table/DataDictionaryPage';
import themeDecorator from '../themeDecorator';

const meta = {
	component: DataDictionaryPage,
	title: 'Viewer - Table/Data Dictionary Page',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof DataDictionaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple mock dictionary with lorem ipsum content
const mockDictionary: Dictionary = {
	name: 'sample-dictionary',
	version: '1.0',
	description:
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	schemas: [
		{
			name: 'sample-schema-1',
			description:
				'Paritur Lorem sint commodo deserunt duis nostrud. Quis cillum veniam dolor amet elit nulla. Pariatur sunt ex non minim labore et exercitation quis velit duis. Nisi minim commodo anim aute quis incididunt proident enim adipisicing eu do.',
			fields: [
				{
					name: 'field1',
					valueType: 'string',
					description: 'Lorem ipsum field description',
					restrictions: {},
				},
				{
					name: 'field2',
					valueType: 'integer',
					description: 'Another field with description',
					restrictions: {},
				},
			],
		},
		{
			name: 'sample-schema-2',
			description:
				'Magna esse labore eiusmod irure sunt cupidatat non et labore. Pariatur consectetur cupidatat ullamco dolor sit commodo proident cupidatat nulla occaecat qui ea. Ad nostrud magna quis anim veniam laboris do sint cillum nisi.',
			fields: [
				{
					name: 'field3',
					valueType: 'string',
					description: 'Et sint enim eu proident ipsum',
					restrictions: {},
				},
			],
		},
	],
	references: {},
};

export const Default: Story = {
	args: {
		dictionary: mockDictionary,
		lecternUrl: 'http://localhost:3031',
	},
};

export const Disabled: Story = {
	args: {
		dictionary: mockDictionary,
		lecternUrl: 'http://localhost:3031',
		disabled: true,
	},
};

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import type { SchemaField } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { EntitiesDiagram } from '../../src/viewer-diagram/EntitiesDiagram';

import biosampleDictionary from '../fixtures/minimalBiosampleModel';
import websiteUserDictionary from '../fixtures/websiteUsersDataDictionary';

const meta = {
	component: EntitiesDiagram,
	title: 'Viewer - Diagram/Entities Diagram',
	tags: ['autodocs'],

	render: (args) => (
		<div
			style={{
				height: '40vh',
			}}
		>
			<EntitiesDiagram {...args} />
		</div>
	),
} satisfies Meta<typeof EntitiesDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BiosampleDictionary: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { dictionary: biosampleDictionary, layout: { columnWidth: 600, maxColumns: 4, rowHeight: 500 } },
};

export const WebsiteUserDictionary: Story = {
	args: { dictionary: websiteUserDictionary },
};

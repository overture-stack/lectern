/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import type { SchemaField } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { EntitiesDiagram } from '../../src/viewer-diagram/EntitiesDiagram';
import { EntitiesDiagramSchemaNode } from '../../src/viewer-diagram/EntitiesDiagramSchemaNode';
import biosampleDictionary from '../fixtures/minimalBiosampleModel';
import websiteUserDictionary from '../fixtures/websiteUsersDataDictionary';
import { buildSchemaNode } from '../../src/viewer-diagram/SchemaFlowNode';
import { ReactFlowProvider } from 'reactflow';

const meta = {
	component: EntitiesDiagramSchemaNode,
	title: 'Viewer - Diagram/Entities Diagram Schema Node',
	tags: ['autodocs'],

	render: (args) => (
		<ReactFlowProvider>
			<EntitiesDiagramSchemaNode {...args} />
		</ReactFlowProvider>
	),
} satisfies Meta<typeof EntitiesDiagramSchemaNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BiosampleDonor: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { data: buildSchemaNode(websiteUserDictionary.schemas[0]).data },
};

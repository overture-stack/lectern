/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from 'reactflow';
import { SchemaDiagramNode } from '../../src/viewer-diagram/SchemaDiagramNode';
import { buildSchemaNode } from '../../src/viewer-diagram/SchemaFlowNode';
import websiteUserDictionary from '../fixtures/websiteUsersDataDictionary';

const meta = {
	component: SchemaDiagramNode,
	title: 'Viewer - Diagram/Schema Diagram Node',
	tags: ['autodocs'],

	render: (args) => (
		<ReactFlowProvider>
			<SchemaDiagramNode {...args} />
		</ReactFlowProvider>
	),
} satisfies Meta<typeof SchemaDiagramNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BiosampleDonor: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { data: buildSchemaNode(websiteUserDictionary.schemas[0]).data },
};

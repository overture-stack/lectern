/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
/** @jsxImportSource @emotion/react */

import type { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';

import { SchemaNode } from '../../../src/viewer-table/EntityRelationshipDiagram/SchemaNode';
import {
	ActiveRelationshipProvider,
	buildRelationshipMap,
} from '../../../src/viewer-table/EntityRelationshipDiagram';

import DictionarySample from '../../fixtures/pcgl.json';
import websiteUserDictionary from '../../fixtures/websiteUsersDataDictionary';
import themeDecorator from '../../themeDecorator';

const SchemaNodeWrapper = ({ schema, dictionary }: { schema: Schema; dictionary: Dictionary }) => {
	const relationshipMap = useMemo(() => buildRelationshipMap(dictionary), [dictionary]);
	return (
		<ReactFlowProvider>
			<ActiveRelationshipProvider relationshipMap={relationshipMap}>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
					<div style={{ width: 350 }}>
						<SchemaNode data={schema} />
					</div>
				</div>
			</ActiveRelationshipProvider>
		</ReactFlowProvider>
	);
};

const meta = {
	component: SchemaNode,
	title: 'Viewer - Table/Entity Relationship Diagram/Schema Diagram Node',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Individual schema node rendered inside the entity relationship diagram. Displays the schema name, its fields, and key indicators (unique key, foreign key) with data type badges. Foreign key fields are interactive and highlight the related relationship chain when clicked.',
			},
		},
	},
} satisfies Meta<typeof SchemaNode>;

export default meta;
type Story = StoryObj<typeof meta>;

const pcglDictionary = DictionarySample as Dictionary;

/**
 * A basic schema with standard fields and a unique key, but no foreign key relationships.
 */
export const SimpleSchema: Story = {
	args: { data: websiteUserDictionary.schemas[0] as Schema },
	render: (args) => <SchemaNodeWrapper schema={args.data} dictionary={websiteUserDictionary} />,
};

/**
 * A schema that contains foreign key fields referencing another schema,
 * shown with key indicators and interactive highlighting.
 */
export const WithForeignKeys: Story = {
	args: { data: pcglDictionary.schemas.find((s) => s.name === 'diagnosis') as Schema },
	render: (args) => <SchemaNodeWrapper schema={args.data} dictionary={pcglDictionary} />,
};

/**
 * A schema with a large number of fields, demonstrating how the node scales vertically.
 */
export const ManyFields: Story = {
	args: { data: pcglDictionary.schemas.find((s) => s.name === 'treatment') as Schema },
	render: (args) => <SchemaNodeWrapper schema={args.data} dictionary={pcglDictionary} />,
};

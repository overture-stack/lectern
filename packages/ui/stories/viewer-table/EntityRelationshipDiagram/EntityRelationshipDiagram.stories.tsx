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

import type { Meta, StoryObj } from '@storybook/react';
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { useMemo } from 'react';

import React from 'react';
import {
	ActiveRelationshipProvider,
	buildRelationshipMap,
	RelationshipDiagramContent,
} from '../../../src/viewer-table/EntityRelationshipDiagram';
import DictionarySample from '../../fixtures/pcgl.json';
import SimpleClinicalERDiagram from '../../fixtures/simpleClinicalERDiagram.json';
import SingleSchemaFixture from '../../fixtures/singleSchema.json';
import TwoIsolatedSchemasFixture from '../../fixtures/twoIsolatedSchemas.json';
import TwoSchemaLinearFixture from '../../fixtures/twoSchemaLinear.json';
import ThreeSchemaChainFixture from '../../fixtures/threeSchemaChain.json';
import MultiFkFixture from '../../fixtures/multiFk.json';
import FanOutFixture from '../../fixtures/fanOut.json';
import MixedRelationsFixture from '../../fixtures/mixedRelations.json';
import CompoundKeyFixture from '../../fixtures/compoundKey.json';
import CyclicalFixture from '../../fixtures/cyclical.json';
import InvalidUniqueKeyFixture from '../../fixtures/invalid_uniquekey.json';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: RelationshipDiagramContent,
	title: 'Viewer - Table/Entity Relationship Diagram/Entity Relationship Diagram',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Interactive entity relationship diagram that visualizes foreign key relationships between schemas. Schemas are rendered as nodes with fields, and edges connect foreign key fields to their referenced unique key fields. Clicking a foreign key field highlights the full relationship chain across schemas.',
			},
			story: {
				inline: false,
				iframeHeight: 600,
			},
		},
	},
} satisfies Meta<typeof RelationshipDiagramContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const StoryWrapper = ({ dictionary }: { dictionary: Dictionary }) => {
	const relationshipMap = useMemo(() => buildRelationshipMap(dictionary), [dictionary]);
	return (
		<ActiveRelationshipProvider relationshipMap={relationshipMap}>
			<RelationshipDiagramContent dictionary={dictionary} />
		</ActiveRelationshipProvider>
	);
};

/**
 * Full PCGL dictionary with 17 schemas and multiple foreign key relationships.
 */
export const Default: Story = {
	args: {
		dictionary: DictionarySample as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A simplified clinical data model with a handful of related schemas.
 */
export const SimpleClinicalExample: Story = {
	args: {
		dictionary: SimpleClinicalERDiagram as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A dictionary with only one schema and no relationships.
 */
export const SingleSchema: Story = {
	args: {
		dictionary: SingleSchemaFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * Two schemas with no foreign key relationships between them.
 */
export const TwoIsolatedSchemas: Story = {
	args: {
		dictionary: TwoIsolatedSchemasFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * Two schemas connected by a single foreign key.
 */
export const TwoSchemaLinear: Story = {
	args: {
		dictionary: TwoSchemaLinearFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * Three schemas linked in a chain: A → B → C.
 */
export const ThreeSchemaChain: Story = {
	args: {
		dictionary: ThreeSchemaChainFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A schema with multiple foreign keys referencing different schemas.
 */
export const MultiFk: Story = {
	args: {
		dictionary: MultiFkFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * One parent schema referenced by multiple child schemas (fan-out pattern).
 */
export const FanOut: Story = {
	args: {
		dictionary: FanOutFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A mix of linear chains, fan-out, and isolated schemas.
 */
export const MixedRelations: Story = {
	args: {
		dictionary: MixedRelationsFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A foreign key mapping that uses a compound (multi-field) key.
 */
export const CompoundKey: Story = {
	args: {
		dictionary: CompoundKeyFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * Schemas with cyclical foreign key references (A → B → A).
 */
export const Cyclical: Story = {
	args: {
		dictionary: CyclicalFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

/**
 * A foreign key that references a field which is not a unique key,
 * testing graceful handling of invalid configurations.
 */
export const NonUniqueForeignKey: Story = {
	args: {
		dictionary: InvalidUniqueKeyFixture as Dictionary,
	},
	render: (args) => (
		<div style={{ width: '100%', height: '100vh' }}>
			<StoryWrapper dictionary={args.dictionary} />
		</div>
	),
};

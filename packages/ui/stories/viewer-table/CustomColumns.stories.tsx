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

import { css } from '@emotion/react';
import { type Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import type { CustomColumnComponentProps } from '../../src/viewer-table/customColumnTypes';
import MetaValueRenderer from '../../src/viewer-table/DataTable/SchemaTable/Columns/MetaValueRenderer';
import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable/index';
import { getByDotPath } from '../../src/utils/getByDotPath';
import { useThemeContext } from '../../src/theme/index';
import PCGL from '../fixtures/pcgl.json';
import themeDecorator from '../themeDecorator';

const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);

// The participant schema has fields with rich meta (mappings, examples, etc.)
const participantSchema = pcglDictionary.schemas[0];

const meta = {
	component: SchemaTable,
	title: 'Viewer - Table/Custom Columns/Schema Table with Custom Columns',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		docs: {
			description: {
				component:
					'Demonstrates the `customColumns` prop on SchemaTable. Custom columns can use a `metaPath` to display a meta value with the default MetaValueRenderer, a custom `columnComponent`, or both.',
			},
		},
	},
} satisfies Meta<typeof SchemaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No custom columns — the table renders with the four default columns only.
 */
export const NoCustomColumns: Story = {
	args: {
		schema: participantSchema,
	},
};

/**
 * A single custom column using `metaPath` to display the FHIR mapping for each field.
 * Fields without a FHIR mapping show an empty cell.
 */
export const SingleMetaPathColumn: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'FHIR Mapping', metaPath: 'meta.mappings.FHIR' }],
	},
};

/**
 * Multiple metaPath columns showing different mapping standards side by side.
 */
export const MultipleMetaPathColumns: Story = {
	args: {
		schema: participantSchema,
		customColumns: [
			{ columnHeader: 'FHIR', metaPath: 'meta.mappings.FHIR' },
			{ columnHeader: 'ARGO', metaPath: 'meta.mappings.ARGO' },
			{ columnHeader: 'Phenopacket', metaPath: 'meta.mappings.Phenopacket' },
		],
	},
};

/**
 * A metaPath pointing to the entire `mappings` object, rendered as a key-value list
 * by MetaValueRenderer.
 */
export const ObjectMetaPath: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'All Mappings', metaPath: 'meta.mappings' }],
	},
};

/**
 * A metaPath pointing to examples (an array of strings), rendered as a list.
 */
export const ArrayMetaPath: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'Examples', metaPath: 'meta.examples' }],
	},
};

/**
 * A custom column using `columnComponent` only. The component receives the full field
 * but no metaPath or value, and renders whether a field has any mappings defined.
 */
const HasMappingsCell = ({ field }: CustomColumnComponentProps) => {
	const theme = useThemeContext();
	const mappings = field.meta?.mappings;
	const hasMappings = mappings != null && typeof mappings === 'object' && Object.keys(mappings).length > 0;

	return (
		<span
			css={css`
				${theme.typography.data}
				color: ${hasMappings ? theme.colors.accent_dark : theme.colors.grey_5};
			`}
		>
			{hasMappings ? 'Yes' : 'No'}
		</span>
	);
};

export const ComponentOnlyColumn: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'Has Mappings', columnComponent: HasMappingsCell }],
	},
};

/**
 * A custom column using both `metaPath` and `columnComponent`. The component receives
 * the resolved FHIR mapping value and renders it as a styled badge when present.
 */
const FhirBadgeCell = ({ value }: CustomColumnComponentProps) => {
	const theme = useThemeContext();
	if (value == null) return null;

	return (
		<span
			css={css`
				display: inline-flex;
				align-items: center;
				padding: 2px 8px;
				border-radius: 20px;
				border: 0.5px solid ${theme.colors.accent_dark};
				background-color: rgba(255, 255, 255, 0.15);
				color: ${theme.colors.accent_dark};
				${theme.typography.data}
			`}
		>
			{String(value)}
		</span>
	);
};

export const MetaPathWithComponent: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'FHIR Mapping', metaPath: 'meta.mappings.FHIR', columnComponent: FhirBadgeCell }],
	},
};

/**
 * Mixing different column types in a single configuration: a metaPath-only column,
 * a component-only column, and a combined metaPath+component column.
 */
export const MixedColumnTypes: Story = {
	args: {
		schema: participantSchema,
		customColumns: [
			{ columnHeader: 'ARGO Mapping', metaPath: 'meta.mappings.ARGO' },
			{ columnHeader: 'Has Mappings', columnComponent: HasMappingsCell },
			{
				columnHeader: 'FHIR Badge',
				metaPath: 'meta.mappings.FHIR',
				columnComponent: FhirBadgeCell,
			},
		],
	},
};

/**
 * Demonstrates a component that uses `getByDotPath` and `MetaValueRenderer` internally
 * to compose custom rendering with the standard display utilities.
 */
const MappingCountCell = ({ field }: CustomColumnComponentProps) => {
	const theme = useThemeContext();
	const mappings = getByDotPath(field, 'meta.mappings');
	const count = mappings != null && typeof mappings === 'object' ? Object.keys(mappings).length : 0;

	return (
		<div>
			<span
				css={css`
					${theme.typography.data}
				`}
			>
				{count} mapping{count !== 1 ? 's' : ''}
			</span>
			{count > 0 && <MetaValueRenderer value={mappings} />}
		</div>
	);
};

export const ComponentUsingExportedUtilities: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'Mapping Details', columnComponent: MappingCountCell }],
	},
};

/**
 * A metaPath that doesn't match any data in the schema fields, producing empty cells
 * for all rows.
 */
export const NonexistentMetaPath: Story = {
	args: {
		schema: participantSchema,
		customColumns: [{ columnHeader: 'Missing Path', metaPath: 'meta.nonexistent.path' }],
	},
};

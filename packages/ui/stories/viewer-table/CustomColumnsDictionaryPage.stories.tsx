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
import type { Meta, StoryObj } from '@storybook/react';

import { DictionaryTableViewer } from '../../src/viewer-table/DictionaryTableViewer';
import type { CustomColumnComponentProps } from '../../src/viewer-table/customColumnTypes';
import { useThemeContext } from '../../src/theme/index';
import { withSingleDictionary } from '../dictionaryDecorator';
import themeDecorator from '../themeDecorator';

const meta = {
	component: DictionaryTableViewer,
	title: 'Viewer - Table/Custom Columns/Dictionary Page with Custom Columns',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Full DictionaryTableViewer with custom columns. Shows how the `customColumns` prop integrates with the complete dictionary viewer including accordion, toolbar, and all schemas.',
			},
			story: {
				inline: false,
				iframeHeight: 600,
			},
		},
	},
} satisfies Meta<typeof DictionaryTableViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Dictionary page with a single FHIR mapping column added via metaPath.
 */
export const WithFhirColumn: Story = {
	decorators: [withSingleDictionary],
	args: {
		customColumns: [{ columnHeader: 'FHIR Mapping', metaPath: 'meta.mappings.FHIR' }],
	},
};

/**
 * Dictionary page with multiple mapping columns.
 */
export const WithMultipleMappingColumns: Story = {
	decorators: [withSingleDictionary],
	args: {
		customColumns: [
			{ columnHeader: 'FHIR', metaPath: 'meta.mappings.FHIR' },
			{ columnHeader: 'ARGO', metaPath: 'meta.mappings.ARGO' },
		],
	},
};

/**
 * Dictionary page displaying all mappings as an object column.
 */
export const WithAllMappingsColumn: Story = {
	decorators: [withSingleDictionary],
	args: {
		customColumns: [{ columnHeader: 'All Mappings', metaPath: 'meta.mappings' }],
	},
};

const FhirBadge = ({ value }: CustomColumnComponentProps) => {
	const theme = useThemeContext();
	if (value == null) return null;
	return (
		<span
			css={css`
				display: inline-flex;
				padding: 2px 8px;
				border-radius: 20px;
				border: 0.5px solid ${theme.colors.accent_dark};
				color: ${theme.colors.accent_dark};
				${theme.typography.data}
			`}
		>
			{String(value)}
		</span>
	);
};

/**
 * Dictionary page with a custom component column alongside a metaPath column.
 */
export const WithMixedColumns: Story = {
	decorators: [withSingleDictionary],
	args: {
		customColumns: [
			{ columnHeader: 'FHIR Badge', metaPath: 'meta.mappings.FHIR', columnComponent: FhirBadge },
			{ columnHeader: 'ARGO Mapping', metaPath: 'meta.mappings.ARGO' },
		],
	},
};

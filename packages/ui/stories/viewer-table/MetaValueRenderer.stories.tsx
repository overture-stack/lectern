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

import type { Meta, StoryObj } from '@storybook/react';

import MetaValueRenderer from '../../src/viewer-table/DataTable/SchemaTable/Columns/MetaValueRenderer';
import themeDecorator from '../themeDecorator';

const meta = {
	component: MetaValueRenderer,
	title: 'Viewer - Table/Custom Columns/MetaValueRenderer',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		docs: {
			description: {
				component:
					'Renders a meta value appropriately for display in a table cell. Handles strings, numbers, booleans, arrays, objects, URLs, and null/undefined values. Long values are truncated with the existing "show more" pattern.',
			},
		},
	},
} satisfies Meta<typeof MetaValueRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringValue: Story = {
	args: { value: 'Patient.Identifier' },
};

export const UrlValue: Story = {
	args: { value: 'https://hl7.org/fhir/R4/patient.html' },
};

export const NumberValue: Story = {
	args: { value: 42 },
};

export const BooleanValue: Story = {
	args: { value: true },
};

export const ArrayValue: Story = {
	args: { value: ['90234', 42, true, 'https://hl7.org/fhir/R4/patient.html', 'AML-90'] },
};

export const SimpleObject: Story = {
	args: {
		value: {
			FHIR: 'Patient.Identifier',
			ARGO: 'submitter_participant_id',
			CQDG: 'submitter_participant_id',
		},
	},
};

export const ObjectWithMixedValues: Story = {
	args: {
		value: {
			optionA: 'value 1',
			optionB: 987654321,
			optionC: ['a', 'b', 'c'],
			optionD: [123, 456, 789],
		},
	},
};

export const NestedObject: Story = {
	args: {
		value: {
			value: 'value 1',
			withNested: {
				value: 123,
				mostNested: {
					value: ['a', 'b', 'c'],
					moreNested: {
						valuest: "important data, don't forget me!",
					},
				},
			},
		},
	},
};

export const ObjectWithUrls: Story = {
	args: {
		value: {
			FHIR: 'https://hl7.org/fhir/R4/patient.html',
			Phenopacket: 'https://phenopacket-schema.readthedocs.io/',
			localId: 'individual.id',
		},
	},
};

export const NullOrUndefinedValue: Story = {
	args: { value: null },
};

/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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
import { Description } from '../../../src/viewer-table/ConditionalLogicModal/Description';
import { SchemaField } from '@overture-stack/lectern-dictionary';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: Description,
	title: 'Viewer - Table/Conditional Modal/Description',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Description>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldWithConditionalRestrictions: SchemaField = {
	name: 'tissue_source_other',
	description: `If the tissue source is 'other', specify the source here.`,
	valueType: 'string',
	restrictions: [
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source', 'tissue_source_other'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source', 'tissue_source_other', 'tissue_source_other_detail'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: [
							'tissue_source',
							'tissue_source_other',
							'tissue_source_other_detail',
							'tissue_source_other_description',
						],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: [
							'tissue_source',
							'tissue_source_other',
							'tissue_source_other_detail',
							'tissue_source_other_description',
						],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
		{
			if: {
				conditions: [
					{
						fields: ['tissue_source'],
						match: {
							value: 'Other',
						},
					},
				],
			},
			then: {
				required: true,
			},
			else: {
				empty: true,
			},
		},
	],
};

const fieldWithoutConditionalRestrictions: SchemaField = {
	name: 'sample_type',
	description: 'Type of molecular sample used for testing.',
	valueType: 'string',
};

export const WithConditionalRestrictions: Story = {
	args: {
		schemaLevelField: fieldWithConditionalRestrictions,
	},
};

export const WithoutConditionalRestrictions: Story = {
	args: {
		schemaLevelField: fieldWithoutConditionalRestrictions,
	},
};

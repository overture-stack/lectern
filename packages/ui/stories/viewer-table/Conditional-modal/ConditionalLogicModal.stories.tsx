/** @jsxImportSource @emotion/react */

import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Button from '../../../src/common/Button';
import { ConditionalLogicModal } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalLogicModal';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: ConditionalLogicModal,
	title: 'Viewer Table/Conditional Modal/ConditionalLogicModal',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ConditionalLogicModal>;

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

const case1Restriction: SchemaFieldRestrictions = {
	if: {
		conditions: [
			{
				fields: ['image_hosted_format'],
				match: { value: 'PNG' },
				case: 'all',
			},
		],
	},
	then: {
		required: true,
		codeList: ['pipelineA', 'pipelineB', 'pipelineC'],
	},
	else: {
		if: {
			conditions: [
				{
					fields: ['image_hosted_format'],
					match: { value: 'SVG' },
					case: 'all',
				},
			],
		},
		then: {
			required: true,
			codeList: ['pipelineA', 'pipelineD', 'pipelineE'],
		},
		else: [
			{ codeList: ['OPTION_A', 'OPTION_B', 'OPTION_C'] },
			{ codeList: ['OPTION_A'] },
			{ codeList: ['OPTION_B', 'OPTION_A'] },
			{ regex: '^[a-zA-Z0-9]+$' },
			{
				if: {
					conditions: [
						{
							fields: ['image_processing_null_reason'],
							match: { exists: false },
							case: 'all',
						},
					],
				},
				then: {
					required: true,
					codeList: ['pipelineA', 'pipelineB', 'pipelineC'],
				},
				else: { empty: true },
			},
		],
	},
};

const case2Field: SchemaField = {
	name: 'pipeline_with_array_then',
	valueType: 'string',
	description: 'Restriction with then as array (codeList + nested if/then/else)',
};

const case2Restriction: SchemaFieldRestrictions = {
	if: {
		conditions: [{ fields: ['image_format'], match: { value: 'PNG' }, case: 'all' }],
	},
	then: [
		{ codeList: ['pipeline_A', 'pipeline_B'] },
		{
			if: { conditions: [{ fields: ['other_field'], match: { value: 'X' }, case: 'all' }] },
			then: { codeList: ['pipeline_X'] },
			else: { codeList: ['pipeline_Y'] },
		},
	],
	else: { codeList: ['pipeline_C', 'pipeline_D'] },
};

// --- CASE 3: Highly nested if/then/else structure ---
const case3Field: SchemaField = {
	name: 'highly_nested_case',
	valueType: 'string',
	description: 'A highly nested if/then/else structure for UI stress test',
};

const case3Restriction: SchemaFieldRestrictions = {
	if: { conditions: [{ fields: ['A'], match: { value: 1 }, case: 'all' }] },
	then: {
		if: { conditions: [{ fields: ['B'], match: { value: 2 }, case: 'all' }] },
		then: {
			if: { conditions: [{ fields: ['C'], match: { value: 3 }, case: 'all' }] },
			then: {
				if: { conditions: [{ fields: ['D'], match: { value: 4 }, case: 'all' }] },
				then: {
					if: { conditions: [{ fields: ['E'], match: { value: 5 }, case: 'all' }] },
					then: {
						if: { conditions: [{ fields: ['F'], match: { value: 6 }, case: 'all' }] },
						then: {
							if: { conditions: [{ fields: ['G'], match: { value: 7 }, case: 'all' }] },
							then: { codeList: ['super_deep_value'] },
							else: { codeList: ['not_super_deep'] },
						},
						else: { codeList: ['not_f'] },
					},
					else: { codeList: ['not_e'] },
				},
				else: { codeList: ['not_deep_value'] },
			},
			else: { codeList: ['not_c'] },
		},
		else: { codeList: ['not_b'] },
	},
	else: { codeList: ['not_a'] },
};

export const Case1_DeeplyNested: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case1Restriction,
		currentSchemaField: fieldWithConditionalRestrictions,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 1: Deeply Nested Restriction</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case2_ThenArrayWithNested: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case2Restriction,
		currentSchemaField: case2Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 2: Then Array (codeList + nested if/then/else)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case3_HighlyNested: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case3Restriction,
		currentSchemaField: case3Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 3: Highly Nested If/Then/Else</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
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

const imageProcessingPipelineField: SchemaField = {
	name: 'image_processing_pipeline',
	valueType: 'string',
	description:
		'Post processing pipeline dependent on image_hosted_format where:\n - image_hosted_format is PNG, choices are \n* PipelineA\n* PipelineB\n* PipelineC\n - image_hosted_format is SVG, choices are \n* PipelineA\n* PipelineD\n* PipelineE\n - image_hosted_format is PDF or JPEG, choices are \n* PipelineA\n* PipelineD\n* PipelineF',
};

var mixedRestrictions: SchemaFieldRestrictions = [
	{
		if: {
			conditions: [
				{
					fields: ['image_processing_null_reason'],
					match: {
						exists: false,
					},
					case: 'all',
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
	{ codeList: ['OPTION_A', 'OPTION_B', 'OPTION_C'] },
];

const imageProcessingPipelineRestriction: SchemaFieldRestrictions = {
	if: {
		conditions: [
			{
				fields: ['image_hosted_format'],
				match: {
					value: 'PNG',
				},
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
					match: {
						value: 'SVG',
					},
					case: 'all',
				},
			],
		},
		then: {
			required: true,
			codeList: ['pipelineA', 'pipelineD', 'pipelineE'],
		},
		else: mixedRestrictions,
	},
};

// 2. imaging.image_processing_personel - Simple conditional based on existence
const imageProcessingPersonelField: SchemaField = {
	name: 'image_processing_personel',
	valueType: 'string',
	description:
		"String value for the person who processed the image.\nMust be provided.If not 'image_processing_null_reason' must be provided",
};

const imageProcessingPersonelRestriction: SchemaFieldRestrictions = {
	if: {
		conditions: [
			{
				fields: ['image_processing_null_reason'],
				match: {
					exists: false,
				},
				case: 'all',
			},
		],
	},
	then: {
		required: true,
	},
	else: {
		empty: true,
	},
};

// 3. imaging.image_processing_null_reason - Simple conditional based on existence
const imageProcessingNullReasonField: SchemaField = {
	name: 'image_processing_null_reason',
	valueType: 'string',
	description:
		'Tracks reason for why image processing personnel was not provided.\nOnly applicable if image_processing_personnel is not provided.\nPossible values:\n* Unknown\n* Revoked\n* Not Provided\nOtherwise leave empty',
};

const imageProcessingNullReasonRestriction: SchemaFieldRestrictions = {
	if: {
		conditions: [
			{
				fields: ['image_processing_personel'],
				match: {
					exists: false,
				},
				case: 'all',
			},
		],
	},
	then: {
		required: true,
		codeList: ['Unknown', 'Not Provided', 'Revoked'],
	},
	else: {
		empty: true,
	},
};

// Simple restrictions for comparison
const simpleRestrictionsField: SchemaField = {
	name: 'simple_field',
	valueType: 'string',
	description: 'A field with simple restrictions for comparison',
};

const simpleRestrictions: SchemaFieldRestrictions = {
	required: true,
	regex: '^[A-Z]+$',
	codeList: ['OPTION_A', 'OPTION_B', 'OPTION_C'],
};

const manyRestrictions: SchemaFieldRestrictions = [
	{
		if: {
			conditions: [
				{
					fields: ['image_processing_null_reason'],
					match: {
						exists: false,
					},
					case: 'all',
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
					fields: ['image_processing_null_reason'],
					match: {
						exists: false,
					},
					case: 'all',
				},
			],
		},
		then: {
			if: {
				conditions: [
					{
						fields: ['image_processing_null_reason'],
						match: {
							exists: false,
						},
						case: 'all',
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
		else: {
			empty: true,
		},
	},
];

// Mixed restrictions field - has both codeList and conditional logic
const mixedRestrictionsField: SchemaField = {
	name: 'mixed_restrictions_field',
	valueType: 'string',
	description: 'A field with both code list restrictions and conditional logic',
};

export const ImageProcessingPipeline_NestedConditional: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: imageProcessingPipelineRestriction,
		currentSchemaField: imageProcessingPipelineField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Image Processing Pipeline (nested conditionals)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const ImageProcessingPersonel_ExistenceCheck: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: imageProcessingPersonelRestriction,
		currentSchemaField: imageProcessingPersonelField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Image Processing Personnel (existence check)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const ImageProcessingNullReason_ExistenceCheck: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: imageProcessingNullReasonRestriction,
		currentSchemaField: imageProcessingNullReasonField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Image Processing Null Reason (existence check)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const SimpleRestrictions_NoConditionals: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: simpleRestrictions,
		currentSchemaField: simpleRestrictionsField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Simple Restrictions (no conditionals)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Many_Restrictions: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: manyRestrictions,
		currentSchemaField: simpleRestrictionsField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Many Restrictions</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const MixedRestrictions_CodeListAndConditionals: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: mixedRestrictions,
		currentSchemaField: mixedRestrictionsField,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Mixed Restrictions (code list + conditionals)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

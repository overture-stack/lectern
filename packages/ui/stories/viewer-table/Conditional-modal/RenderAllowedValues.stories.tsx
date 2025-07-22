/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';

import RenderAllowedValues from '../../../src/viewer-table/ConditionalLogicModal/RenderAllowedValues';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: RenderAllowedValues,
	title: 'Viewer Table/Render Allowed Values',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof RenderAllowedValues>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Required: Story = {
	args: {
		currentSchemaFieldName: 'required',
		restrictions: {
			required: true,
		},
	},
};

export const RegularExpressionSingle: Story = {
	args: {
		currentSchemaFieldName: 'regex',
		restrictions: {
			regex: '^[A-Z]{3}-\\d{4}$',
		},
	},
};

export const RegularExpressionMultiple: Story = {
	args: {
		currentSchemaFieldName: 'regex',
		restrictions: {
			regex: ['^[A-Z]{3}-\\d{4}$', '^[a-z]+@[a-z]+\\.[a-z]{2,3}$', '^\\d{10}$'],
		},
	},
};

export const CodeListStrings: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			codeList: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
		},
	},
};

export const CodeListNumbers: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			codeList: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
		},
	},
};

export const CodeListLargeSet: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			codeList: [
				'BRCA1',
				'BRCA2',
				'TP53',
				'APOE',
				'CFTR',
				'HTT',
				'EGFR',
				'MYC',
				'RAS',
				'PTEN',
				'APC',
				'RB1',
				'ATR',
				'PALB',
				'CDK2',
				'VHL',
				'NF1',
				'MLH1',
				'MSH2',
				'ATM',
				'PALB2',
				'CDH1',
				'STK11',
				'CHEK2',
				'NBN',
				'RAD51',
				'FANCF',
				'CHEK1',
				'WINT',
				'KISS',
			],
		},
	},
};

export const CodeListSingleValue: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			codeList: 'OnlyOption',
		},
	},
};

export const EmptyAllowed: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			empty: true,
		},
	},
};

export const MultipleRestrictions: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			required: true,
			regex: '^[A-Z]{2,4}$',
			codeList: ['USA', 'CAN', 'UK', 'FR', 'DE', 'JP', 'AU', 'BR', 'IN', 'CN'],
		},
	},
};

export const PipelineExample: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {
			required: true,
			codeList: ['pipelineA', 'pipelineC', 'pipelineD'],
		},
	},
};

export const NoRestrictions: Story = {
	args: {
		currentSchemaFieldName: 'codeList',
		restrictions: {},
	},
};

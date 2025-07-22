/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import RenderAllowedValues from '../../../src/viewer-table/ConditionalLogicModal/RenderAllowedValues';
import TorontoMapleLeafs from '../../fixtures/TorontoMapleLeafs.json';
import themeDecorator from '../../themeDecorator';

const torontoMapleLeafsDictionary: Dictionary = replaceReferences(TorontoMapleLeafs as Dictionary);

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
		currentSchemaField: torontoMapleLeafsDictionary.schemas[1].fields[0], // player_name field
		restrictions: {
			required: true,
		},
	},
};

export const RegularExpressionSingle: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[0].fields[0], // game_id field
		restrictions: {
			regex: '^[A-Z]{3}-\\d{4}$',
		},
	},
};

export const RegularExpressionMultiple: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[2].fields[5], // time_in_period field
		restrictions: {
			regex: ['^[A-Z]{3}-\\d{4}$', '^[a-z]+@[a-z]+\\.[a-z]{2,3}$', '^\\d{10}$'],
		},
	},
};

export const CodeListStrings: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[0].fields[7], // game_tags field
		restrictions: {
			codeList: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
		},
	},
};

export const CodeListNumbers: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[2].fields[4], // period field with integer codeList
		restrictions: {
			codeList: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
		},
	},
};

export const CodeListLargeSet: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[0].fields[6], // three_stars_of_the_game field
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
		currentSchemaField: torontoMapleLeafsDictionary.schemas[1].fields[6], // player_status field
		restrictions: {
			codeList: 'OnlyOption',
		},
	},
};

export const EmptyAllowed: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[1].fields[7], // injury_details field
		restrictions: {
			empty: true,
		},
	},
};

export const MultipleRestrictions: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[0].fields[0], // game_id field
		restrictions: {
			required: true,
			regex: '^[A-Z]{2,4}$',
			codeList: ['USA', 'CAN', 'UK', 'FR', 'DE', 'JP', 'AU', 'BR', 'IN', 'CN'],
		},
	},
};

export const PipelineExample: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[2].fields[3], // event_type field
		restrictions: {
			required: true,
			codeList: ['pipelineA', 'pipelineC', 'pipelineD'],
		},
	},
};

export const NoRestrictions: Story = {
	args: {
		currentSchemaField: torontoMapleLeafsDictionary.schemas[4].fields[1], // optional_field
		restrictions: {},
	},
};

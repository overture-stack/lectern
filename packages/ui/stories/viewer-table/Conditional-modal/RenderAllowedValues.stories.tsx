/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import RenderAllowedValues from '../../../src/viewer-table/ConditionalLogicModal/RenderAllowedValues';
import pcgl from '../../fixtures/pcgl.json';
import themeDecorator from '../../themeDecorator';

const pcglDictionary: Dictionary = replaceReferences(pcgl as Dictionary);

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
		currentSchemaField: pcglDictionary.schemas[0].fields[0], // submitter_participant_id field
		restrictions: {
			required: true,
		},
	},
};

export const RegularExpressionSingle: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[2].fields[0], // submitter_diagnosis_id field
		restrictions: {
			regex: '^[A-Za-z0-9\\-\\._]{1,64}$',
		},
	},
};

export const RegularExpressionMultiple: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[2], // disease_specific_modifier field
		restrictions: {
			regex: ['^MONDO:\\d{7}$', '^[A-Z]{2,4}-\\d{4}$', '^[a-z]+@[a-z]+\\.[a-z]{2,3}$'],
		},
	},
};

export const CodeListStrings: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[4], // duo_permission field
		restrictions: {
			codeList: [
				'DUO:0000042 (general research use)',
				'DUO:0000006 (health or medical or biomedical research)',
				'DUO:0000007 (disease specific research)',
				'DUO:0000011 (population origins or ancestry research only)',
				'DUO:0000004 (no restriction)',
			],
		},
	},
};

export const CodeListNumbers: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[2], // age_at_sociodem_collection field
		restrictions: {
			codeList: [0, 365, 730, 1095, 1460, 1825, 2190, 2555, 2920, 3285],
		},
	},
};

export const CodeListLargeSet: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[3], // education field
		restrictions: {
			codeList: [
				'No formal education',
				'Elementary school or equivalent',
				'High school (secondary school) diploma or equivalency certificate',
				'College, CEGEP, or other non-university certificate or diploma',
				"Bachelor's degree",
				'Degree in medicine, dentistry, veterinary medicine or optometry',
				"Master's degree",
				'Doctoral degree',
				'Post-doctoral fellowship or training',
				'Prefer not to answer',
				'Not applicable',
				'Missing - Unknown',
				'Missing - Not collected',
				'Missing - Not provided',
				'Missing - Restricted access',
			],
		},
	},
};

export const EmptyAllowed: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[2], // disease_specific_modifier field
		restrictions: {
			empty: true,
		},
	},
};

export const MultipleRestrictions: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[0], // submitter_participant_id field
		restrictions: {
			required: true,
			regex: '^[A-Za-z0-9\\-\\._]{1,64}$',
		},
	},
};

export const NoRestrictions: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[1], // submitter_participant_id in sociodemographic
		restrictions: {},
	},
};

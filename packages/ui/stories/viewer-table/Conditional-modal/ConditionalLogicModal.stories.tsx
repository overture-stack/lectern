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
			codeList: [
				'pipelineA',
				'pipelineB',
				'pipelineC',
				'pipelineD',
				'pipelineE',
				'pipelineF',
				'pipelineG',
				'pipelineH',
				'pipelineI',
				'pipelineJ',
				'pipelineK',
				'pipelineL',
				'pipelineM',
				'pipelineN',
				'pipelineO',
				'pipelineP',
				'pipelineQ',
				'pipelineR',
				'pipelineS',
				'pipelineT',
				'pipelineU',
				'pipelineV',
				'pipelineW',
				'pipelineX',
				'pipelineY',
				'pipelineZ',
			],
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

// --- CASE 4: Multiple Restrictions with Many Conditions ---
const case4Field: SchemaField = {
	name: 'complex_validation_field',
	valueType: 'string',
	description: 'Field with multiple complex restrictions and many conditions',
};

const case4Restriction: SchemaFieldRestrictions = [
	{
		if: {
			conditions: [
				{ fields: ['user_role'], match: { value: 'admin' }, case: 'all' },
				{ fields: ['department'], match: { value: 'IT' }, case: 'all' },
				{ fields: ['security_level'], match: { value: 'high' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['super_admin', 'system_admin', 'network_admin', 'security_admin'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['user_role'], match: { value: 'manager' }, case: 'all' },
				{ fields: ['team_size'], match: { regex: '^[5-9]$' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['team_lead', 'project_manager', 'department_head'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['experience_years'], match: { regex: '^[0-2]$' }, case: 'all' },
				{ fields: ['certification'], match: { exists: true }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['junior_dev', 'intern', 'trainee'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['location'], match: { value: 'remote' }, case: 'all' },
				{ fields: ['timezone'], match: { regex: '^UTC[+-][0-9]{1,2}$' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['remote_worker', 'digital_nomad', 'home_office'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['project_type'], match: { value: 'critical' }, case: 'all' },
				{ fields: ['deadline'], match: { exists: true }, case: 'all' },
				{ fields: ['budget'], match: { regex: '^[0-9]{6,}$' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['senior_dev', 'architect', 'tech_lead'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['work_mode'], match: { value: 'hybrid' }, case: 'all' },
				{ fields: ['office_days'], match: { regex: '^[1-3]$' }, case: 'all' },
				{ fields: ['commute_distance'], match: { regex: '^[0-9]{1,2}$' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['hybrid_worker', 'flexible_schedule', 'office_optional'],
		},
		else: { empty: true },
	},
	{
		if: {
			conditions: [
				{ fields: ['skill_level'], match: { value: 'expert' }, case: 'all' },
				{ fields: ['years_experience'], match: { regex: '^[5-9]$' }, case: 'all' },
				{ fields: ['certifications'], match: { exists: true }, case: 'all' },
				{ fields: ['mentorship'], match: { value: 'active' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: ['senior_expert', 'team_mentor', 'technical_lead', 'domain_specialist'],
		},
		else: { empty: true },
	},
];

// --- CASE 5: Long Code Lists ---
const case5Field: SchemaField = {
	name: 'country_selection',
	valueType: 'string',
	description: 'Field with extremely long code list of countries',
};

const case5Restriction: SchemaFieldRestrictions = {
	if: {
		conditions: [{ fields: ['registration_type'], match: { value: 'international' }, case: 'all' }],
	},
	then: {
		required: true,
		codeList: [
			'Afghanistan',
			'Albania',
			'Algeria',
			'Andorra',
			'Angola',
			'Antigua and Barbuda',
			'Argentina',
			'Armenia',
			'Australia',
			'Austria',
			'Azerbaijan',
			'Bahamas',
			'Bahrain',
			'Bangladesh',
			'Barbados',
			'Belarus',
			'Belgium',
			'Belize',
			'Benin',
			'Bhutan',
			'Bolivia',
			'Bosnia and Herzegovina',
			'Botswana',
			'Brazil',
			'Brunei',
			'Bulgaria',
			'Burkina Faso',
			'Burundi',
			'Cabo Verde',
			'Cambodia',
			'Cameroon',
			'Canada',
			'Central African Republic',
			'Chad',
			'Chile',
			'China',
			'Colombia',
			'Comoros',
			'Congo',
			'Costa Rica',
			'Croatia',
			'Cuba',
			'Cyprus',
			'Czech Republic',
			'Democratic Republic of the Congo',
			'Denmark',
			'Djibouti',
			'Dominica',
			'Dominican Republic',
			'Ecuador',
			'Egypt',
			'El Salvador',
			'Equatorial Guinea',
			'Eritrea',
			'Estonia',
			'Eswatini',
			'Ethiopia',
			'Fiji',
			'Finland',
			'France',
			'Gabon',
			'Gambia',
			'Georgia',
			'Germany',
			'Ghana',
			'Greece',
			'Grenada',
			'Guatemala',
			'Guinea',
			'Guinea-Bissau',
			'Guyana',
			'Haiti',
			'Honduras',
			'Hungary',
			'Iceland',
			'India',
			'Indonesia',
			'Iran',
			'Iraq',
			'Ireland',
			'Israel',
			'Italy',
			'Ivory Coast',
			'Jamaica',
			'Japan',
			'Jordan',
			'Kazakhstan',
			'Kenya',
			'Kiribati',
			'Kuwait',
			'Kyrgyzstan',
			'Laos',
			'Latvia',
			'Lebanon',
			'Lesotho',
			'Liberia',
			'Libya',
			'Liechtenstein',
			'Lithuania',
			'Luxembourg',
			'Madagascar',
			'Malawi',
			'Malaysia',
			'Maldives',
			'Mali',
			'Malta',
			'Marshall Islands',
			'Mauritania',
			'Mauritius',
			'Mexico',
			'Micronesia',
			'Moldova',
			'Monaco',
			'Mongolia',
			'Montenegro',
			'Morocco',
			'Mozambique',
			'Myanmar',
			'Namibia',
			'Nauru',
			'Nepal',
			'Netherlands',
			'New Zealand',
			'Nicaragua',
			'Niger',
			'Nigeria',
			'North Korea',
			'North Macedonia',
			'Norway',
			'Oman',
			'Pakistan',
			'Palau',
			'Palestine',
			'Panama',
			'Papua New Guinea',
			'Paraguay',
			'Peru',
			'Philippines',
			'Poland',
			'Portugal',
			'Qatar',
			'Romania',
			'Russia',
			'Rwanda',
			'Saint Kitts and Nevis',
			'Saint Lucia',
			'Saint Vincent and the Grenadines',
			'Samoa',
			'San Marino',
			'Sao Tome and Principe',
			'Saudi Arabia',
			'Senegal',
			'Serbia',
			'Seychelles',
			'Sierra Leone',
			'Singapore',
			'Slovakia',
			'Slovenia',
			'Solomon Islands',
			'Somalia',
			'South Africa',
			'South Korea',
			'South Sudan',
			'Spain',
			'Sri Lanka',
			'Sudan',
			'Suriname',
			'Sweden',
			'Switzerland',
			'Syria',
			'Taiwan',
			'Tajikistan',
			'Tanzania',
			'Thailand',
			'Timor-Leste',
			'Togo',
			'Tonga',
			'Trinidad and Tobago',
			'Tunisia',
			'Turkey',
			'Turkmenistan',
			'Tuvalu',
			'Uganda',
			'Ukraine',
			'United Arab Emirates',
			'United Kingdom',
			'United States',
			'Uruguay',
			'Uzbekistan',
			'Vanuatu',
			'Vatican City',
			'Venezuela',
			'Vietnam',
			'Yemen',
			'Zambia',
			'Zimbabwe',
		],
	},
	else: {
		codeList: ['United States', 'Canada', 'Mexico'],
	},
};

// --- CASE 6: Extreme Nesting (10 levels) ---
const case6Field: SchemaField = {
	name: 'extreme_nesting_test',
	valueType: 'string',
	description: 'Extremely nested if/then/else structure for UI stress testing (10 levels)',
};

const case6Restriction: SchemaFieldRestrictions = {
	if: { conditions: [{ fields: ['level1'], match: { value: 'A' }, case: 'all' }] },
	then: {
		if: { conditions: [{ fields: ['level2'], match: { value: 'B' }, case: 'all' }] },
		then: {
			if: { conditions: [{ fields: ['level3'], match: { value: 'C' }, case: 'all' }] },
			then: {
				if: { conditions: [{ fields: ['level4'], match: { value: 'D' }, case: 'all' }] },
				then: {
					if: { conditions: [{ fields: ['level5'], match: { value: 'E' }, case: 'all' }] },
					then: {
						if: { conditions: [{ fields: ['level6'], match: { value: 'F' }, case: 'all' }] },
						then: {
							if: { conditions: [{ fields: ['level7'], match: { value: 'G' }, case: 'all' }] },
							then: {
								if: { conditions: [{ fields: ['level8'], match: { value: 'H' }, case: 'all' }] },
								then: {
									if: { conditions: [{ fields: ['level9'], match: { value: 'I' }, case: 'all' }] },
									then: {
										if: { conditions: [{ fields: ['level10'], match: { value: 'J' }, case: 'all' }] },
										then: { codeList: ['deepest_nested_value'] },
										else: { codeList: ['level10_false'] },
									},
									else: { codeList: ['level9_false'] },
								},
								else: { codeList: ['level8_false'] },
							},
							else: { codeList: ['level7_false'] },
						},
						else: { codeList: ['level6_false'] },
					},
					else: { codeList: ['level5_false'] },
				},
				else: { codeList: ['level4_false'] },
			},
			else: { codeList: ['level3_false'] },
		},
		else: { codeList: ['level2_false'] },
	},
	else: { codeList: ['level1_false'] },
};

// --- CASE 8: 7-Level Nesting with Conditional at Last Level ---
const case8Field: SchemaField = {
	name: 'seven_level_nesting_with_conditional',
	valueType: 'string',
	description: '7-level nested if/then/else structure with conditional logic at the deepest level',
};

const case8Restriction: SchemaFieldRestrictions = {
	if: { conditions: [{ fields: ['level1'], match: { value: 'A' }, case: 'all' }] },
	then: {
		if: { conditions: [{ fields: ['level2'], match: { value: 'B' }, case: 'all' }] },
		then: {
			if: { conditions: [{ fields: ['level3'], match: { value: 'C' }, case: 'all' }] },
			then: {
				if: { conditions: [{ fields: ['level4'], match: { value: 'D' }, case: 'all' }] },
				then: {
					if: { conditions: [{ fields: ['level5'], match: { value: 'E' }, case: 'all' }] },
					then: {
						if: { conditions: [{ fields: ['level6'], match: { value: 'F' }, case: 'all' }] },
						then: {
							if: { conditions: [{ fields: ['level7'], match: { value: 'G' }, case: 'all' }] },
							then: {
								if: { conditions: [{ fields: ['final_condition'], match: { value: 'success' }, case: 'all' }] },
								then: { codeList: ['ultimate_success_value'] },
								else: { codeList: ['conditional_failure_value'] },
							},
							else: { codeList: ['level7_false'] },
						},
						else: { codeList: ['level6_false'] },
					},
					else: { codeList: ['level5_false'] },
				},
				else: { codeList: ['level4_false'] },
			},
			else: { codeList: ['level3_false'] },
		},
		else: { codeList: ['level2_false'] },
	},
	else: { codeList: ['level1_false'] },
};

// --- CASE 9: Soccer Scores Playful Data ---
const case9Field: SchemaField = {
	name: 'soccer_match_result',
	valueType: 'string',
	description: 'Soccer match result field with playful data to demonstrate data agnosticism',
};

const case9Restriction: SchemaFieldRestrictions = {
	if: {
		conditions: [
			{ fields: ['match_type'], match: { value: 'World Cup Final' }, case: 'all' },
			{ fields: ['stadium_capacity'], match: { regex: '^[0-9]{5,}$' }, case: 'all' },
		],
	},
	then: {
		required: true,
		codeList: [
			'Brazil 2-1 Germany',
			'Argentina 3-2 France',
			'Spain 1-0 Netherlands',
			'Italy 1-1 France (5-3 pens)',
			'Germany 1-0 Argentina',
			'Brazil 0-0 Italy (3-2 pens)',
			'France 3-0 Brazil',
			'Argentina 2-1 England',
			'Brazil 4-1 Italy',
			'Germany 2-1 Argentina',
		],
	},
	else: {
		if: {
			conditions: [
				{ fields: ['league'], match: { value: 'Premier League' }, case: 'all' },
				{ fields: ['season'], match: { regex: '^202[0-9]$' }, case: 'all' },
			],
		},
		then: {
			required: true,
			codeList: [
				'Manchester City 4-0 Liverpool',
				'Arsenal 3-1 Chelsea',
				'Manchester United 2-2 Tottenham',
				'Liverpool 5-0 Manchester United',
				'Chelsea 1-0 Arsenal',
				'Tottenham 3-2 Manchester City',
				'Liverpool 4-1 Arsenal',
				'Manchester United 1-1 Chelsea',
				'Manchester City 2-0 Tottenham',
				'Arsenal 2-2 Liverpool',
			],
		},
		else: {
			if: {
				conditions: [
					{ fields: ['match_type'], match: { value: 'Friendly' }, case: 'all' },
					{ fields: ['home_team'], match: { exists: true }, case: 'all' },
				],
			},
			then: {
				required: false,
				codeList: [
					'Home Team 2-1 Away Team',
					'Away Team 0-0 Home Team',
					'Home Team 3-2 Away Team',
					'Away Team 1-1 Home Team',
					'Home Team 4-0 Away Team',
				],
			},
			else: {
				codeList: ['TBD', 'Postponed', 'Cancelled', 'Abandoned'],
			},
		},
	},
};

export const Case4_MultipleRestrictions: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case4Restriction,
		currentSchemaField: case4Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 4: Multiple Restrictions with Many Conditions</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case5_LongCodeLists: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case5Restriction,
		currentSchemaField: case5Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 5: Long Code Lists (Countries)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case6_ExtremeNesting: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case6Restriction,
		currentSchemaField: case6Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 6: Extreme Nesting (10 levels)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case8_SevenLevelNesting: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case8Restriction,
		currentSchemaField: case8Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 8: 7-Level Nesting with Conditional</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

export const Case9_SoccerScores: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
		restrictions: case9Restriction,
		currentSchemaField: case9Field,
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Case 9: Soccer Scores (Playful Data)</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

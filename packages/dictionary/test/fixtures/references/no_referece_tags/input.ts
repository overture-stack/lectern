import { Dictionary } from '../../../../src';

const content: Dictionary = {
	name: 'Test Dictionary',
	version: '1.2',
	schemas: [
		{
			name: 'donor',
			description: 'Donor Entity',
			fields: [
				{
					name: 'donor_submitter_id',
					valueType: 'string',
					description: 'Unique identifier for donor; assigned by data provider',
					meta: {
						displayName: 'Submitter Donor ID',
						key: true,
					},
					restrictions: {
						regex: '^[\\w]*$',
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: {
						codeList: ['Male', 'Female', 'Other'],
					},
				},
				{
					name: 'ethnicity',
					valueType: 'string',
					description: 'Self described',
					meta: {
						default: 'Unknown',
					},
					restrictions: {},
				},
			],
		},
	],
	references: {
		regex: {
			REPEATED_TEXT: '(\\w+).*\\1',
			ALPHA_ONLY: '^[A-Za-z]*$',
			COMBINED: ['#/regex/ID_REG_EXP', '#/regex/ALPHA_ONLY'],
		},
		enums: {
			SEX: ['Male', 'Female', 'Other'],
		},
	},
};

export default content;

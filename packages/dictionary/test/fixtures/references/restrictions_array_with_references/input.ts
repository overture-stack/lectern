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
					name: 'imaginary_field',
					valueType: 'string',
					description: 'Nonsense example to test an array of restriction objects.',
					meta: {
						displayName: 'Submitter Donor ID',
						key: true,
					},
					restrictions: [
						{
							regex: ['#/regex/REPEATED_TEXT', '#/regex/ALPHA_ONLY'],
						},
						{
							codeList: '#/enums/SEX',
							required: true,
						},
					],
				},
				{
					name: 'nonsense_field',
					valueType: 'string',
					description: 'another meaningless example testing complex references within an array.',
					restrictions: [
						{
							regex: '#/regex/COMBINED',
						},
					],
				},
			],
		},
	],
	references: {
		regex: {
			REPEATED_TEXT: '(\\w+).*\\1',
			ALPHA_ONLY: '^[A-Za-z]*$',
			COMBINED: ['#/regex/REPEATED_TEXT', '#/regex/ALPHA_ONLY'],
		},
		enums: {
			SEX: ['Male', 'Female', 'Other'],
		},
	},
};
export default content;

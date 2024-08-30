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
							regex: ['(\\w+).*\\1', '^[A-Za-z]*$'],
						},
						{
							codeList: ['Male', 'Female', 'Other'],
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
							regex: ['(\\w+).*\\1', '^[A-Za-z]*$'],
						},
					],
				},
			],
		},
	],
};
export default content;

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
						regex: '^[\\w\\s\\W]{5,}$',
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: {
						codeList: ['Male', 'Female', 'Unknown', 'No answer', 'Other'],
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
};
export default content;

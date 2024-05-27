import { Dictionary } from '../../../../src';

const content: Dictionary = {
	name: 'test_dictionary',
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
					restrictions: [
						{ unique: true },
						{
							regex: '#/ID_REG_EXP',
						},
					],
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: [
						{ required: true },
						{
							codeList: '#/GENDERS',
						},
					],
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
		GENDERS: ['Male', 'Female', 'Other'],
		ID_REG_EXP: '^[\\w\\s\\W]{5,}$',
	},
};
export default content;

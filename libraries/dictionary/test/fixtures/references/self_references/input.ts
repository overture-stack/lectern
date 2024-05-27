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
					restrictions: {
						regex: '#/ID_REG_EXP',
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: {
						codeList: ['#/SEX', 'Other', '#/SELF_REFERENCE'],
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
		ID_REG_EXP: '^[\\w\\s\\W]{5,}$',
		MALE: 'Male',
		FEMALE: 'Female',
		SELF_REFERENCE: '#/SELF_REFERENCE',
		SEX: ['#/MALE', '#/FEMALE'],
	},
};
export default content;

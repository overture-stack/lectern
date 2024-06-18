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
					name: 'count',
					valueType: 'number',
					restrictions: {
						script: ['(value) => value % 2'],
					},
				},
				{
					name: 'score',
					valueType: 'string',
					description: 'Donor Biological Sex',
					restrictions: {
						script: ['(value) => value/1000 > 9', '(value) => value % 2'],
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

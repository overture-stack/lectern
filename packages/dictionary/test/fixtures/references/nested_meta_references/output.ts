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
						exampleReference: 'This is an example',
						nested1: { nested2: { nested3: ['some', 'text', 'in an', 'array'] } },
					},
				},
			],
		},
	],
};
export default content;

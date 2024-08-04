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
						exampleReference: '#/meta/example',
						nested1: { nested2: { nested3: ['#/meta/nestedMeta/example', 'array'] } },
					},
				},
			],
		},
	],
	references: {
		text: 'text',
		meta: { example: 'This is an example', nestedMeta: { example: ['some', '#/text', 'in an'] } },
	},
};
export default content;

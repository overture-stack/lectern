import { Dictionary } from '../../../../src';

const content: Dictionary = {
	name: 'Test Dictionary',
	version: '1.0',
	schemas: [
		{
			name: 'participant',
			fields: [
				{
					name: 'some_id',
					valueType: 'string',
					restrictions: {
						regex: ['good', 'reference'],
					},
				},
			],
		},
	],
};
export default content;

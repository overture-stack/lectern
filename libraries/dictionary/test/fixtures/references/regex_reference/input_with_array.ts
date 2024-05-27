import { Dictionary } from '../../../../src';

const content: Dictionary = {
	name: 'test_dictionary',
	version: '1.0',
	schemas: [
		{
			name: 'participant',
			fields: [
				{
					name: 'some_id',
					valueType: 'string',
					restrictions: {
						regex: '#/regex/ID_FORMAT',
					},
				},
			],
		},
	],
	references: {
		regex: {
			ID_FORMAT: ['bad', 'reference'],
		},
	},
};
export default content;

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
						regex: '^[A-Z1-9][-_A-Z1-9]{2,7}(-[A-Z][A-Z])$',
					},
				},
			],
		},
	],
};
export default content;

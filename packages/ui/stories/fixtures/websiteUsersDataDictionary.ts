import type { Dictionary } from '@overture-stack/lectern-dictionary';

const dictionary: Dictionary = {
	name: 'sample-data-dictionary',
	version: '1.0',
	description: 'Example dictionary for testing. Schemas are based on common web concepts such as users, posts, etc.',
	meta: {},
	schemas: [
		{
			name: 'user',
			description: 'Website user data',
			restrictions: { uniqueKey: ['name'] },
			fields: [
				{
					name: 'name',
					valueType: 'string',
					restrictions: {
						required: true,
					},
				},
				{
					name: 'age',
					valueType: 'integer',
					restrictions: {
						required: true,
						range: { min: 0, max: 150 },
					},
				},
				{
					name: 'gender',
					valueType: 'string',
					restrictions: {
						required: true,
						codeList: '#/lists/genders',
					},
				},
				{
					name: 'location',
					valueType: 'string',
					restrictions: {
						required: true,
					},
				},
				{
					name: 'phone',
					valueType: 'string',
					restrictions: {
						regex: '^[0-9]{3}-[0-9]{3}-[0-9]{4}$',
					},
				},
				{
					name: 'hobbies',
					valueType: 'string',
					isArray: true,
					delimiter: '|',
				},
			],
		},
	],
	references: {
		lists: {
			genders: ['Male', 'Female', 'Other'],
		},
	},
};

export default dictionary;

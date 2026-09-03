import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaInstitution = {
	name: 'institution',
	description: 'Root of an isolated network. id is unique. Not connected to program or study.',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { required: true } },
		{ name: 'name', valueType: 'string' },
		{ name: 'type', valueType: 'string' },
	],
	restrictions: {
		uniqueKey: ['id'],
	},
} as const satisfies Schema;

assertSchema(schemaInstitution, Schema, 'schemaInstitution is not a valid Schema');

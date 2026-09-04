import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaWideEntity = {
	name: 'wide-entity',
	description: '28 fields across all four value types. The id field is in a uniqueKey. No other restrictions.',
	fields: [
		{ name: 'id', valueType: 'string' },
		{ name: 'name', valueType: 'string' },
		{ name: 'label', valueType: 'string' },
		{ name: 'code', valueType: 'string' },
		{ name: 'category', valueType: 'string' },
		{ name: 'status', valueType: 'string' },
		{ name: 'description', valueType: 'string' },
		{ name: 'count', valueType: 'integer' },
		{ name: 'rank', valueType: 'integer' },
		{ name: 'priority', valueType: 'integer' },
		{ name: 'quantity', valueType: 'integer' },
		{ name: 'version', valueType: 'integer' },
		{ name: 'sequence', valueType: 'integer' },
		{ name: 'index', valueType: 'integer' },
		{ name: 'score', valueType: 'number' },
		{ name: 'weight', valueType: 'number' },
		{ name: 'ratio', valueType: 'number' },
		{ name: 'percentage', valueType: 'number' },
		{ name: 'coefficient', valueType: 'number' },
		{ name: 'magnitude', valueType: 'number' },
		{ name: 'threshold', valueType: 'number' },
		{ name: 'is_active', valueType: 'boolean' },
		{ name: 'is_valid', valueType: 'boolean' },
		{ name: 'is_complete', valueType: 'boolean' },
		{ name: 'is_required', valueType: 'boolean' },
		{ name: 'is_primary', valueType: 'boolean' },
		{ name: 'is_archived', valueType: 'boolean' },
		{ name: 'is_published', valueType: 'boolean' },
	],
	restrictions: {
		uniqueKey: ['id'],
	},
} as const satisfies Schema;

assertSchema(schemaWideEntity, Schema, 'schemaWideEntity is not a valid Schema');

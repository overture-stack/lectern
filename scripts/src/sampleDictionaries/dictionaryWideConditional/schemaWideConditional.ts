import { Schema } from '@overture-stack/lectern-dictionary';
import { assertSchema } from '../assertSchema';

export const schemaWideConditional = {
	name: 'wide-conditional',
	description:
		'28 fields with id in a uniqueKey. Fields status, notes, and score carry conditional restrictions referencing other fields. Field nested_result carries a nested conditional.',
	fields: [
		{ name: 'id', valueType: 'string' },
		{ name: 'name', valueType: 'string' },
		{ name: 'label', valueType: 'string' },
		{ name: 'code', valueType: 'string' },
		{ name: 'category', valueType: 'string' },
		// Conditional field 1: required when is_active is true, empty when false
		{
			name: 'status',
			valueType: 'string',
			restrictions: {
				if: { conditions: [{ fields: ['is_active'], match: { value: true } }] },
				then: { required: true },
				else: { empty: true },
			},
		},
		{ name: 'type', valueType: 'string' },
		{ name: 'source', valueType: 'string' },
		{ name: 'region', valueType: 'string' },
		{ name: 'tag', valueType: 'string' },
		// Conditional field 2: required when category exists and type exists, otherwise empty
		{
			name: 'notes',
			valueType: 'string',
			restrictions: {
				if: {
					conditions: [
						{ fields: ['category'], match: { exists: true } },
						{ fields: ['type'], match: { exists: true } },
					],
				},
				then: { required: true },
				else: { empty: true },
			},
		},
		{ name: 'count', valueType: 'integer' },
		{ name: 'rank', valueType: 'integer' },
		{ name: 'priority', valueType: 'integer' },
		{ name: 'quantity', valueType: 'integer' },
		{ name: 'version', valueType: 'integer' },
		{ name: 'sequence', valueType: 'integer' },
		{ name: 'index', valueType: 'integer' },
		// Conditional field 3: range restriction applied only when is_primary is true
		{
			name: 'score',
			valueType: 'number',
			restrictions: {
				if: { conditions: [{ fields: ['is_primary'], match: { value: true } }] },
				then: { range: { min: 0, max: 1 } },
			},
		},
		{ name: 'weight', valueType: 'number' },
		{ name: 'ratio', valueType: 'number' },
		{ name: 'percentage', valueType: 'number' },
		{ name: 'coefficient', valueType: 'number' },
		// Conditional field 4 (nested): if code has value, check rank — if rank >= 1 require notes, if is_complete true require label
		{
			name: 'nested_result',
			valueType: 'string',
			restrictions: [
				{
					if: { conditions: [{ fields: ['code'], match: { exists: true } }] },
					then: [
						{
							if: { conditions: [{ fields: ['rank'], match: { range: { min: 1 } } }] },
							then: { required: true },
						},
						{
							if: { conditions: [{ fields: ['is_complete'], match: { value: true } }] },
							then: { regex: '^[A-Z]' },
						},
					],
					else: { empty: true },
				},
			],
		},
		{ name: 'is_active', valueType: 'boolean' },
		{ name: 'is_valid', valueType: 'boolean' },
		{ name: 'is_complete', valueType: 'boolean' },
		{ name: 'is_primary', valueType: 'boolean' },
	],
	restrictions: {
		uniqueKey: ['id'],
	},
} as const satisfies Schema;

assertSchema(schemaWideConditional, Schema, 'schemaWideConditional is not a valid Schema');

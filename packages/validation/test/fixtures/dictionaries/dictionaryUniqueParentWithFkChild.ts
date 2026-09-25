import { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { validateFixture } from '../../testUtils/validateFixture';

/**
 * A dictionary with:
 * - `unique-parent`: a parent schema with a unique string field (`parent-id`)
 * - `fk-child`: a child schema with a required field (`required-field`) and a
 *   foreignKey restriction mapping `parent-ref` to `parent-id` in `unique-parent`
 *
 * Used in DictionaryValidator tests to exercise unique violations, FK violations,
 * and record-level errors together.
 */

const uniqueParentSchema = {
	name: 'unique-parent',
	fields: [
		{
			name: 'parent-id',
			valueType: 'string',
			unique: true,
		},
	],
} as const satisfies Schema;

validateFixture(uniqueParentSchema, Schema, 'uniqueParentSchema is not a valid Schema');

const fkChildSchema = {
	name: 'fk-child',
	fields: [
		{
			name: 'parent-ref',
			valueType: 'string',
		},
		{
			name: 'required-field',
			valueType: 'string',
			restrictions: { required: true },
		},
	],
	restrictions: {
		foreignKey: [
			{
				schema: uniqueParentSchema.name,
				mappings: [{ foreign: 'parent-id', local: 'parent-ref' }],
			},
		],
	},
} as const satisfies Schema;

validateFixture(fkChildSchema, Schema, 'fkChildSchema is not a valid Schema');

export const dictionaryUniqueParentWithFkChild = {
	name: 'dictionary-unique-parent-with-fk-child',
	schemas: [uniqueParentSchema, fkChildSchema],
	version: '1.0',
} as const satisfies Dictionary;

validateFixture(
	dictionaryUniqueParentWithFkChild,
	Dictionary,
	'dictionaryUniqueParentWithFkChild is not a valid Dictionary',
);

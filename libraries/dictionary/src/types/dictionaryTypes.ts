/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { z as zod } from 'zod';
import allUnique from '../utils/allUnique';
import { ReferenceTag, References } from './referenceTypes';

export const NameString = zod
	.string()
	.min(1, 'Name fields cannot be empty.')
	.regex(RegExp('^[^.]+$'), 'Name fields cannot have `.` characters.');
export type NameString = zod.infer<typeof NameString>;

export const Integer = zod.number().int();

// Meta accepts as values only strings, numbers, booleans, arrays of numbers or arrays of strings
// Another Meta object can be nested inside a Meta property
export const DictionaryMetaValue = zod.union([
	zod.string(),
	zod.number(),
	zod.boolean(),
	zod.array(zod.string()),
	zod.array(zod.number()),
]);
export type DictionaryMetaValue = zod.infer<typeof DictionaryMetaValue>;
export type DictionaryMeta = { [key: string]: DictionaryMetaValue | DictionaryMeta };
export const DictionaryMeta: zod.ZodType<DictionaryMeta> = zod.record(
	zod.union([DictionaryMetaValue, zod.lazy(() => DictionaryMeta)]),
);

export const SchemaFieldValueType = zod.enum(['string', 'integer', 'number', 'boolean']);
export type SchemaFieldValueType = zod.infer<typeof SchemaFieldValueType>;

/* ************ *
 * Restrictions *
 * ************ */
export const RestrictionScript = zod.array(zod.string().or(ReferenceTag)).min(1); //TODO: script formatting validation
export type RestrictionScript = zod.infer<typeof RestrictionScript>;

export const RestrictionNumberRange = zod
	.object({
		exclusiveMax: zod.number().optional(),
		exclusiveMin: zod.number().optional(),
		max: zod.number().optional(),
		min: zod.number().optional(),
	})
	.refine(
		(data) =>
			data.exclusiveMax !== undefined ||
			data.max !== undefined ||
			data.exclusiveMin !== undefined ||
			data.min !== undefined,
		'Range restriction requires one of `exclusiveMax`, `exclusiveMin`, `max` or `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMin !== undefined && data.min !== undefined),
		'Range restriction cannot have both `exclusiveMin` and `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMax !== undefined && data.max !== undefined),
		'Range restriction cannot have both `exclusiveMax` and `max`.',
	);

export const RestrictionIntegerRange = zod
	.object({
		exclusiveMax: Integer.optional(),
		exclusiveMin: Integer.optional(),
		max: Integer.optional(),
		min: Integer.optional(),
	})
	.refine(
		(data) =>
			data.exclusiveMax !== undefined ||
			data.max !== undefined ||
			data.exclusiveMin !== undefined ||
			data.min !== undefined,
		'Range restriction requires one of `exclusiveMax`, `exclusiveMin`, `max` or `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMin !== undefined && data.min !== undefined),
		'Range restriction cannot have both `exclusiveMin` and `min`.',
	)
	.refine(
		(data) => !(data.exclusiveMax !== undefined && data.max !== undefined),
		'Range restriction cannot have both `exclusiveMax` and `max`.',
	);

export const RestrictionRange = RestrictionNumberRange;
export type RestrictionRange = zod.infer<typeof RestrictionIntegerRange>;

export const RestrictionRegex = zod.string().superRefine((data, context) => {
	try {
		// Attempt to build regexp from the value
		RegExp(data);
	} catch (e) {
		// Thrown error creating regex, so we add validation issue.
		const errorMessage = e instanceof Error ? e.message : `${e}`;
		context.addIssue({
			code: zod.ZodIssueCode.custom,
			message: `Error converting expression to Regex: ${errorMessage}`,
		});
	}
});
export type RestrictionRegex = zod.infer<typeof RestrictionRegex>;

/* ****************************** *
 * Field Type Restriction Objects *
 * ****************************** */
export const StringFieldRestrictions = zod
	.object({
		codeList: zod.union([zod.string(), ReferenceTag]).array().min(1).or(ReferenceTag),
		required: zod.boolean(),
		script: RestrictionScript.or(ReferenceTag),
		regex: RestrictionRegex.or(ReferenceTag),
		unique: zod.boolean(),
	})
	.partial();
export type StringFieldRestrictions = zod.infer<typeof StringFieldRestrictions>;

export const NumberFieldRestrictions = zod
	.object({
		codeList: zod.array(zod.number()).min(1).or(ReferenceTag),
		required: zod.boolean(),
		script: RestrictionScript.or(ReferenceTag),
		range: RestrictionNumberRange,
		unique: zod.boolean(),
	})
	.partial();
export type NumberFieldRestrictions = zod.infer<typeof NumberFieldRestrictions>;

export const IntegerFieldRestrictions = zod
	.object({
		codeList: zod.array(Integer).min(1).or(ReferenceTag),
		required: zod.boolean(),
		script: RestrictionScript.or(ReferenceTag),
		range: RestrictionIntegerRange,
		unique: zod.boolean(),
	})
	.partial();
export type IntegerFieldRestrictions = zod.infer<typeof IntegerFieldRestrictions>;

export const BooleanFieldRestrictions = zod
	.object({ required: zod.boolean(), script: RestrictionScript.or(ReferenceTag), unique: zod.boolean() })
	.partial();
export type BooleanFieldRestrictions = zod.infer<typeof BooleanFieldRestrictions>;

/* ***************** *
 * Field Definitions *
 * ***************** */
export const SchemaFieldBase = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
		isArray: zod.boolean().optional(),
		meta: DictionaryMeta.optional(),
	})
	.strict();
export type SchemaFieldBase = zod.infer<typeof SchemaFieldBase>;

export const SchemaStringField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.string),
		restrictions: StringFieldRestrictions.optional(),
	}),
).strict();
export type SchemaStringField = zod.infer<typeof SchemaStringField>;

export const SchemaNumberField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.number),
		restrictions: NumberFieldRestrictions.optional(),
	}),
).strict();
export type SchemaNumberField = zod.infer<typeof SchemaNumberField>;

export const SchemaIntegerField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.integer),
		restrictions: IntegerFieldRestrictions.optional(),
	}),
).strict();
export type SchemaIntegerField = zod.infer<typeof SchemaIntegerField>;

export const SchemaBooleanField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.boolean),
		restrictions: BooleanFieldRestrictions.optional(),
	}),
).strict();
export type SchemaBooleanField = zod.infer<typeof SchemaBooleanField>;

export const SchemaField = zod.discriminatedUnion('valueType', [
	SchemaStringField,
	SchemaNumberField,
	SchemaIntegerField,
	SchemaBooleanField,
]);
export type SchemaField = zod.infer<typeof SchemaField>;

export type SchemaRestrictions = SchemaField['restrictions'];

/* ****** *
 * Schema *
 * ****** */
export const ForeignKeyRestrictionMapping = zod.object({
	schema: NameString,
	mappings: zod.array(
		zod.object({
			local: NameString,
			foreign: NameString,
		}),
	),
});

export const Schema = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
		fields: zod.array(SchemaField).min(1),
		meta: DictionaryMeta.optional(),
		restrictions: zod
			.object({
				foreignKey: zod.array(ForeignKeyRestrictionMapping).min(1),
				uniqueKey: zod.array(NameString).min(1),
			})
			.partial()
			.optional(),
	})
	.strict()
	.refine(
		(schema) => allUnique(schema.fields.map((field) => field.name)),
		'All fields in the schema must have a unique name.',
	)
	.refine((schema) => {
		if (schema.restrictions && schema.restrictions.uniqueKey) {
			return schema.restrictions.uniqueKey
				.map((requiredField) => schema.fields.some((field) => field.name === requiredField))
				.every((requiredField) => requiredField);
		} else {
			return true;
		}
	}, "A field listed in schema restrictions.uniqueKey is not included the schema's fields")
	.superRefine((schema, ctx) => {
		const fieldNames = schema.fields.map((field) => field.name);
		if (schema.restrictions?.foreignKey) {
			schema.restrictions.foreignKey.forEach((fkRestriction) => {
				if (fkRestriction.schema === schema.name) {
					ctx.addIssue({
						code: zod.ZodIssueCode.custom,
						message: `Schema '${schema.name}' has a foreignKey restriction that references itself. ForeignKey restrictions must reference another schema.`,
					});
				} else {
					fkRestriction.mappings.forEach((fkMapping) => {
						if (!fieldNames.includes(fkMapping.local)) {
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema '${schema.name}' has a foreign key restriction with local field '${fkMapping.local}' that does not exist in the schema's fields.`,
							});
						}
					});
				}
			});
		}
	});
export type Schema = zod.infer<typeof Schema>;

/* ********** *
 * Dictionary *
 * ********** */

export const VersionString = zod.string().regex(RegExp('^[0-9]+.[0-9]+$'));
// TODO: Semantic Versioning version string, reference: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39
// update requires dictionary service changes, leaving like this for now
// .regex(RegExp('^([0-9]+).([0-9]+).([0-9]+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?(?:+[0-9A-Za-z-]+)?$'));

// Dictionary Base is the dictionary object types only, no refinements enforcing the restriction rules.
// This is needed to use for the base of the dbType DictionaryDocument
export const DictionaryBase = zod
	.object({
		name: zod.string().min(1),
		description: zod.string().optional(),
		meta: DictionaryMeta.optional(),
		references: References.optional(),
		schemas: zod.array(Schema).min(1),
		version: VersionString,
	})
	.strict();
export const Dictionary = DictionaryBase.refine(
	(dictionary) => allUnique(dictionary.schemas.map((schema) => schema.name)),
	// TODO: Can improve uniqueness check error by providing list of duplicate field names.
	'All schemas in the dictionary must have a unique name.',
).superRefine((dictionary, ctx) => {
	/**
	 * Enforce schema foreignKey restrictions:
	 * 1. make sure that the foreign schema referenced in all provided foreignKey restrictions have matching schemas in the dictionary
	 * 2. make sure all foreign fields listed in foreignKey restrictions have matching fields in the specified foreign schemas
	 */

	// List of all schemas and all their fields, for cross reference from the foreignKey checks
	const schemaNames = dictionary.schemas.map((schema) => schema.name);
	const schemaFieldMap: Record<string, string[]> = dictionary.schemas.reduce<Record<string, string[]>>(
		(acc, schema) => {
			const fieldNames = schema.fields.map((field) => field.name);
			return { ...acc, [schema.name]: fieldNames };
		},
		{},
	);

	// Loop through each schema and apply checks if they have a foreignKey restriction
	dictionary.schemas.forEach((schema) => {
		if (schema.restrictions?.foreignKey) {
			// We have a foreign key restriction, now we will now check its properties all reference existing schemas and fields

			schema.restrictions.foreignKey.forEach((fkRestriction) => {
				if (schemaNames.includes(fkRestriction.schema)) {
					fkRestriction.mappings.forEach((fkMapping) => {
						if (!schemaFieldMap[fkRestriction.schema]?.includes(fkMapping.foreign)) {
							// foreign field does not exist on foreign schema
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema ForeignKey restriction references a foreign field that does not exist on the foreign schema. The schema '${schema.name}' references the foreign schema named '${fkRestriction.schema}' with foreign field '${fkMapping.foreign}'.`,
							});
						}

						// ensure mapped fields are the same type
						const localFieldType = schema.fields.find((field) => field.name === fkMapping.local)?.valueType;
						const foreignFieldType = dictionary.schemas
							.find((s) => s.name === fkRestriction.schema)
							?.fields.find((field) => field.name === fkMapping.foreign)?.valueType;
						if (localFieldType && foreignFieldType && localFieldType !== foreignFieldType) {
							//dont match undefined === undefined. Missing field validations are output elsewhere so don't check that here.
							ctx.addIssue({
								code: zod.ZodIssueCode.custom,
								message: `Schema ForeignKey restriction maps two fields of different types: the restriction in schema '${schema}' maps local field '${fkMapping.local}' of type '${localFieldType}' to foreign schema '${fkRestriction.schema}' and field '${fkMapping.foreign}' of type '${foreignFieldType}'.`,
							});
						}
					});
				} else {
					// foreign schema name is not included in this dictionary, add error to context
					ctx.addIssue({
						code: zod.ZodIssueCode.custom,
						message: `Schema ForeignKey restriction references a schema name that is not included in the dictionary. The schema '${schema.name}' references foreign schema name '${fkRestriction.schema}'.`,
					});
				}
			});
		}
	});
});
export type Dictionary = zod.infer<typeof Dictionary>;

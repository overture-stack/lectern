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

import { z as zod, type ZodType } from 'zod';
import allUnique from '../utils/allUnique';
import { ReferenceTag, References } from './referenceSchemas';
import {
	ConditionalRestriction,
	ConditionalRestrictionTest,
	RestrictionCodeListInteger,
	RestrictionCodeListNumber,
	RestrictionCodeListString,
	RestrictionIntegerRange,
	RestrictionNumberRange,
	RestrictionRegex,
} from './restrictionsSchemas';

/**
 * String rules for all name fields used in dictionary, including Dictionary, Schema, and Fields.
 * This validates the format of the string since names are not allowed to have `.` characters.
 *
 * Example Values:
 * - `donors`
 * - `primary-site`
 * - `maximumVelocity`
 */
export const NameValue = zod
	.string()
	.min(1, 'Name fields cannot be empty.')
	.regex(/^[^.]+$/, 'Name fields cannot have `.` characters.');
export type NameValue = zod.infer<typeof NameValue>;

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

/* ****************************** *
 * Field Type Restriction Objects *
 * ****************************** */
export const BooleanFieldRestrictions = zod
	.object({ empty: zod.boolean(), required: zod.boolean() })
	.partial()
	.strict();
export type BooleanFieldRestrictions = zod.infer<typeof BooleanFieldRestrictions>;

const BooleanFieldConditionalRestriction: ZodType<ConditionalRestriction<BooleanFieldRestrictions>> = zod
	.object({
		if: ConditionalRestrictionTest,
		then: BooleanFieldRestrictions.or(zod.lazy(() => BooleanFieldConditionalRestriction))
			.or(zod.array(zod.union([BooleanFieldRestrictions, zod.lazy(() => BooleanFieldConditionalRestriction)])))
			.optional(),
		else: BooleanFieldRestrictions.or(zod.lazy(() => BooleanFieldConditionalRestriction))
			.or(zod.array(zod.union([BooleanFieldRestrictions, zod.lazy(() => BooleanFieldConditionalRestriction)])))
			.optional(),
	})
	.strict();

const BooleanFieldRestrictionsObject = BooleanFieldRestrictions.or(BooleanFieldConditionalRestriction);
export type BooleanFieldRestrictionsObject = zod.infer<typeof BooleanFieldRestrictionsObject>;

export const IntegerFieldRestrictions = zod
	.object({
		codeList: RestrictionCodeListInteger.or(ReferenceTag),
		empty: zod.boolean(),
		required: zod.boolean(),
		range: RestrictionIntegerRange,
	})
	.partial()
	.strict();
export type IntegerFieldRestrictions = zod.infer<typeof IntegerFieldRestrictions>;

const IntegerFieldConditionalRestriction: ZodType<ConditionalRestriction<IntegerFieldRestrictions>> = zod
	.object({
		if: ConditionalRestrictionTest,
		then: IntegerFieldRestrictions.or(zod.lazy(() => IntegerFieldConditionalRestriction))
			.or(zod.array(zod.union([IntegerFieldRestrictions, zod.lazy(() => IntegerFieldConditionalRestriction)])))
			.optional(),
		else: IntegerFieldRestrictions.or(zod.lazy(() => IntegerFieldConditionalRestriction))
			.or(zod.array(zod.union([IntegerFieldRestrictions, zod.lazy(() => IntegerFieldConditionalRestriction)])))
			.optional(),
	})
	.strict();

const IntegerFieldRestrictionsObject = IntegerFieldRestrictions.or(IntegerFieldConditionalRestriction);
export type IntegerFieldRestrictionsObject = zod.infer<typeof IntegerFieldRestrictionsObject>;

export const NumberFieldRestrictions = zod
	.object({
		codeList: RestrictionCodeListNumber.or(ReferenceTag),
		empty: zod.boolean(),
		required: zod.boolean(),
		range: RestrictionNumberRange,
	})
	.partial()
	.strict();
export type NumberFieldRestrictions = zod.infer<typeof NumberFieldRestrictions>;

const NumberFieldConditionalRestriction: ZodType<ConditionalRestriction<NumberFieldRestrictions>> = zod
	.object({
		if: ConditionalRestrictionTest,
		then: NumberFieldRestrictions.or(zod.lazy(() => NumberFieldConditionalRestriction))
			.or(zod.array(zod.union([NumberFieldRestrictions, zod.lazy(() => NumberFieldConditionalRestriction)])))
			.optional(),
		else: NumberFieldRestrictions.or(zod.lazy(() => NumberFieldConditionalRestriction))
			.or(zod.array(zod.union([NumberFieldRestrictions, zod.lazy(() => NumberFieldConditionalRestriction)])))
			.optional(),
	})
	.strict();

const NumberFieldRestrictionsObject = NumberFieldRestrictions.or(NumberFieldConditionalRestriction);
export type NumberFieldRestrictionsObject = zod.infer<typeof NumberFieldRestrictionsObject>;

export const StringFieldRestrictions = zod
	.object({
		codeList: RestrictionCodeListString.or(ReferenceTag),
		empty: zod.boolean(),
		required: zod.boolean(),
		regex: RestrictionRegex.or(ReferenceTag),
	})
	.partial()
	.strict();
export type StringFieldRestrictions = zod.infer<typeof StringFieldRestrictions>;

const StringFieldConditionalRestriction: ZodType<ConditionalRestriction<StringFieldRestrictions>> = zod
	.object({
		if: ConditionalRestrictionTest,
		then: StringFieldRestrictions.or(zod.lazy(() => StringFieldConditionalRestriction))
			.or(zod.array(zod.union([StringFieldRestrictions, zod.lazy(() => StringFieldConditionalRestriction)])))
			.optional(),
		else: StringFieldRestrictions.or(zod.lazy(() => StringFieldConditionalRestriction))
			.or(zod.array(zod.union([StringFieldRestrictions, zod.lazy(() => StringFieldConditionalRestriction)])))
			.optional(),
	})
	.strict();

const StringFieldRestrictionsObject = StringFieldRestrictions.or(StringFieldConditionalRestriction);
export type StringFieldRestrictionsObject = zod.infer<typeof StringFieldRestrictionsObject>;

export const AnyFieldRestrictions = zod.union([
	BooleanFieldRestrictions,
	IntegerFieldRestrictions,
	NumberFieldRestrictions,
	StringFieldRestrictions,
]);
export type AnyFieldRestrictions = zod.infer<typeof AnyFieldRestrictions>;

/* ***************** *
 * Field Definitions *
 * ***************** */
export const SchemaFieldBase = zod
	.object({
		name: NameValue,
		displayName: zod.string().optional(),
		description: zod.string().optional(),
		delimiter: zod.string().min(1).optional(),
		isArray: zod.boolean().optional(),
		meta: DictionaryMeta.optional(),
		unique: zod.boolean().optional(),
	})
	.strict();
export type SchemaFieldBase = zod.infer<typeof SchemaFieldBase>;

export const SchemaBooleanField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.boolean),
		restrictions: BooleanFieldRestrictionsObject.or(BooleanFieldRestrictionsObject.array()).optional(),
	}),
).strict();
export type SchemaBooleanField = zod.infer<typeof SchemaBooleanField>;

export const SchemaNumberField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.number),
		restrictions: NumberFieldRestrictionsObject.or(NumberFieldRestrictionsObject.array()).optional(),
	}),
).strict();
export type SchemaNumberField = zod.infer<typeof SchemaNumberField>;

export const SchemaIntegerField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.integer),
		restrictions: IntegerFieldRestrictionsObject.or(IntegerFieldRestrictionsObject.array()).optional(),
	}),
).strict();
export type SchemaIntegerField = zod.infer<typeof SchemaIntegerField>;

export const SchemaStringField = SchemaFieldBase.merge(
	zod.object({
		valueType: zod.literal(SchemaFieldValueType.Values.string),
		restrictions: StringFieldRestrictionsObject.or(StringFieldRestrictionsObject.array()).optional(),
	}),
).strict();
export type SchemaStringField = zod.infer<typeof SchemaStringField>;

export const SchemaField = zod.discriminatedUnion('valueType', [
	SchemaStringField,
	SchemaNumberField,
	SchemaIntegerField,
	SchemaBooleanField,
]);
export type SchemaField = zod.infer<typeof SchemaField>;

export type SchemaFieldRestrictions = SchemaField['restrictions'];

/* ****** *
 * Schema *
 * ****** */
export const ForeignKeyRestriction = zod.object({
	schema: NameValue,
	mappings: zod.array(
		zod.object({
			local: NameValue,
			foreign: NameValue,
		}),
	),
});
export type ForeignKeyRestriction = zod.infer<typeof ForeignKeyRestriction>;

export const Schema = zod
	.object({
		name: NameValue,
		displayName: zod.string().optional(),
		description: zod.string().optional(),
		fields: zod.array(SchemaField).min(1),
		meta: DictionaryMeta.optional(),
		restrictions: zod
			.object({
				foreignKey: zod.array(ForeignKeyRestriction).min(1),
				uniqueKey: zod.array(NameValue).min(1),
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

export type SchemaRestrictions = Schema['restrictions'];

/* ********** *
 * Dictionary *
 * ********** */
/**
 * Validation rules for dictionary version field. The dictionary version is a string with two numbers,
 * a major and minor version. Minor dictionary versions are meant to be backwards compatible with all
 * earlier dictionaries of the same Major version. This is done by making the changes additive for minor
 * changes. Changes that break backwards compatibility of a dictionary should be given a new Major version.
 *
 * Example Values:
 * - `0.0`
 * - `1.0`
 * - `1.1`
 * - `23.45`
 */
export const VersionString = zod.string().regex(/^([0-9]+)\.[0-9]+$/);
// TODO: Semantic Versioning version string, reference: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39
// update requires dictionary service changes, leaving like this for now
// .regex(RegExp('^([0-9]+).([0-9]+).([0-9]+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?(?:+[0-9A-Za-z-]+)?$'));
// This is a valid regexp for semantic versions, but we should instead use the npmjs semantic versioning library
// https://www.npmjs.com/package/semver

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

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

// Unlike references, meta is not nested and accepts as values only primitives or arrays of them.
export const DictionaryMetaValue = zod.union([zod.string(), zod.number(), zod.boolean()]);
export type DictionaryMetaValue = zod.infer<typeof DictionaryMetaValue>;
export const DictionaryMeta = zod.record(DictionaryMetaValue);
export type DictionaryMeta = zod.infer<typeof DictionaryMeta>;

export const SchemaFieldValueType = zod.enum(['string', 'integer', 'number', 'boolean']);
export type DictionaryFieldValueType = zod.infer<typeof SchemaFieldValueType>;

/* ************ *
 * Restrictions *
 * ************ */
export const RestrictionScript = zod.array(zod.string()); //TODO: script formatting validation
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
export type RestrictionNumberRange = zod.infer<typeof RestrictionNumberRange>;

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
export type RestrictionIntegerRange = zod.infer<typeof RestrictionIntegerRange>;

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
		codeList: zod.union([zod.array(zod.string()), ReferenceTag]),
		required: zod.boolean(),
		script: zod.union([RestrictionScript, ReferenceTag]),
		regex: RestrictionRegex,
	})
	.partial();
export type StringFieldRestrictions = zod.infer<typeof StringFieldRestrictions>;

export const NumberFieldRestrictions = zod
	.object({
		codeList: zod.array(zod.number()),
		required: zod.boolean(),
		script: zod.union([RestrictionScript, ReferenceTag]),
		range: RestrictionNumberRange,
	})
	.partial();
export type NumberFieldRestrictions = zod.infer<typeof NumberFieldRestrictions>;

export const IntegerFieldRestrictions = zod
	.object({
		codeList: zod.array(Integer),
		required: zod.boolean(),
		script: zod.union([RestrictionScript, ReferenceTag]),
		range: RestrictionIntegerRange,
	})
	.partial();
export type IntegerFieldRestrictions = zod.infer<typeof IntegerFieldRestrictions>;

export const BooleanFieldRestrictions = zod.object({ required: zod.boolean() }).partial();
export type BooleanFieldRestrictions = zod.infer<typeof BooleanFieldRestrictions>;

/* ***************** *
 * Field Definitions *
 * ***************** */
export const SchemaFieldBase = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
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
export const Schema = zod
	.object({
		name: NameString,
		description: zod.string().optional(),
		fields: zod.array(SchemaField).min(1),
		meta: DictionaryMeta.optional(),
	})
	.strict()
	.refine(
		(schema) => allUnique(schema.fields.map((field) => field.name)),
		// TODO: Can improve uniqueness check error by providing list of duplicate field names.
		'All fields in the schema must have a unique name.',
	);
export type Schema = zod.infer<typeof Schema>;

/* ********** *
 * Dictionary *
 * ********** */

export const VersionString = zod.string().regex(RegExp('^[0-9]+.[0-9]+$'));
// TODO: Semantic Versioning version string, reference: https://gist.github.com/jhorsman/62eeea161a13b80e39f5249281e17c39
// update requires dictionary service changes, leaving like this for now
// .regex(RegExp('^([0-9]+).([0-9]+).([0-9]+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?(?:+[0-9A-Za-z-]+)?$'));

export const Dictionary = zod
	.object({
		name: zod.string().min(1),
		description: zod.string().optional(),
		meta: DictionaryMeta.optional(),
		references: References.optional(),
		schemas: zod.array(Schema).min(1),
		version: VersionString,
	})
	.strict()
	.refine(
		(dictionary) => allUnique(dictionary.schemas.map((schema) => schema.name)),
		// TODO: Can improve uniqueness check error by providing list of duplicate field names.
		'All schemas in the dictionary must have a unique name.',
	);
export type Dictionary = zod.infer<typeof Dictionary>;

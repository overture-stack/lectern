/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import {
	failWith,
	success,
	type DataRecord,
	type DataRecordValue,
	type RestrictionRange,
	type Result,
	type SchemaBooleanField,
	type SchemaField,
	type SchemaIntegerField,
	type SchemaNumberField,
	type SchemaStringField,
	type SingleDataValue,
} from '@overture-stack/lectern-dictionary';
import fc from 'fast-check';
import { collectRestrictions, type CollectedRestrictions } from './resolveRestrictions';
import {
	filterCodeListByRange,
	filterCodeListByRegex,
	reduceCodeLists,
	reduceEmpty,
	reduceRanges,
	reduceRegex,
	reduceRequired,
	type RestrictionConflict,
} from './restrictionReducers';

/* ************************** *
 * Result Types               *
 * ************************** */

/**
 * Payload carried in the failure case of a `FieldGeneratorResult`. The generated value is still
 * present - it was produced using the non-conflicting subset of restrictions and will not satisfy
 * all restrictions. The `conflicts` array describes each pair of restrictions that could not be
 * reconciled.
 */
export type FieldGeneratorFailureData<TValue extends DataRecordValue = DataRecordValue> = {
	value: TValue;
	conflicts: RestrictionConflict[];
};

/**
 * Return type of all field generator functions.
 *
 * - Success: the generated value satisfies all active restrictions.
 * - Failure: one or more restrictions are in conflict and cannot be satisfied simultaneously.
 *   The failure `.data.value` is still a usable value generated from the non-conflicting subset,
 *   but it will not pass validation. The failure `.data.conflicts` describes what conflicted.
 */
export type FieldGeneratorResult<TValue extends DataRecordValue = DataRecordValue> = Result<
	TValue,
	FieldGeneratorFailureData<TValue>
>;

/**
 * Options accepted by all field generator functions.
 *
 * `seed` controls the RNG - the same field, seed, and record always produce the same output.
 * If omitted, a random seed is used.
 *
 * `record` provides already-generated sibling field values used to evaluate conditional
 * restrictions. Fields absent from `record` are treated as undefined. Defaults to an empty record.
 *
 * `arrayLength` controls the number of elements generated for array fields (`field.isArray === true`).
 * Ignored for non-array fields. May be a fixed number or a `RestrictionRange` used to generate
 * the length as an integer within those bounds. If omitted, the length is 1–3.
 *
 * `emptyRate` is the probability (0–1) that a non-required field returns `undefined` instead of a
 * generated value. Values outside [0, 1] are clamped. Defaults to `0.25`. Has no effect when the
 * field's active restrictions include `required: true`.
 */
export type FieldGeneratorOptions = {
	seed?: number;
	record?: DataRecord;
	arrayLength?: number | RestrictionRange;
	emptyRate?: number;
};

/**
 * Function signature for a field value generator. Accepts a schema field definition and an optional
 * `FieldGeneratorOptions` object. Returns a `FieldGeneratorResult`.
 *
 * On success, `result.data` is the generated value. On failure (conflicting restrictions),
 * `result.data.value` is a best-effort value and `result.data.conflicts` lists the conflicts.
 */
export type FieldGenerator<TField extends SchemaField> = (
	field: TField,
	options?: FieldGeneratorOptions,
) => FieldGeneratorResult<DataRecordValue>;

/* ************************** *
 * Internal Helpers           *
 * ************************** */

const DEFAULT_ARRAY_MIN = 1;
const DEFAULT_ARRAY_MAX = 3;

const DEFAULT_EMPTY_RATE = 0.25;

/*
 * A ReferenceTag is a string starting with `#/`. When a codeList or regex contains one it means the
 * dictionary still has unresolved references. Generators skip these entries and use only concrete values.
 */
const isReferenceTag = (value: string): boolean => value.startsWith('#/');

const randomSeed = (): number => Math.floor(Math.random() * 2 ** 32);

/**
 * Draws a single value from a `fast-check` arbitrary using a deterministic seed.
 *
 * Wraps `fc.sample` with `numRuns: 1` and unwraps the result. Throws if `fast-check` produces no
 * value, which should not occur for well-formed arbitraries but is guarded against explicitly
 * because the return type of `fc.sample` does not exclude empty arrays.
 */
const sampleFCGenerator = <T>(arbitrary: fc.Arbitrary<T>, seed: number): T => {
	const [value] = fc.sample(arbitrary, { seed, numRuns: 1 });
	if (value === undefined) {
		throw new Error('fast-check sample produced no value');
	}
	return value;
};

/**
 * Returns `true` if the field should be left empty (return `undefined`) for this generation call.
 *
 * Derives a uniform [0, 1) value from `seed` using a Knuth multiplicative hash followed by one
 * round of xorshift32. This produces a well-distributed independent draw without a second fast-check
 * call, avoiding bias in the `fc.float` arbitrary for small seeds. The threshold comparison
 * (`sample < emptyRate`) maps the draw to the requested probability.
 */
const shouldGenerateEmpty = (seed: number, emptyRate: number): boolean => {
	let hash = (seed * 2654435761 + 1) >>> 0;
	hash ^= hash << 13;
	hash ^= hash >>> 17;
	hash ^= hash << 5;
	const sample = (hash >>> 0) / 4294967296;
	return sample < emptyRate;
};

const resolveArrayLength = (arrayLength: number | RestrictionRange | undefined, seed: number): number => {
	if (arrayLength === undefined) {
		return sampleFCGenerator(fc.integer({ min: DEFAULT_ARRAY_MIN, max: DEFAULT_ARRAY_MAX }), seed);
	}
	if (typeof arrayLength === 'number') {
		return arrayLength;
	}
	const min =
		arrayLength.min ??
		(arrayLength.exclusiveMin !== undefined ? Math.floor(arrayLength.exclusiveMin) + 1 : DEFAULT_ARRAY_MIN);
	const max =
		arrayLength.max ??
		(arrayLength.exclusiveMax !== undefined ? Math.ceil(arrayLength.exclusiveMax) - 1 : DEFAULT_ARRAY_MAX);
	if (min > max) {
		return DEFAULT_ARRAY_MIN;
	}
	return sampleFCGenerator(fc.integer({ min, max }), seed);
};

const extractConflicts = (results: Array<Result<unknown, RestrictionConflict>>): RestrictionConflict[] =>
	results.flatMap((result) => (result.success ? [] : [result.data]));

/**
 * Returns a `RestrictionConflict` when `required: true` and `empty: true` are both active, or
 * `undefined` when the combination is valid. The same conflict applies to all field value types.
 */
const buildRequiredEmptyConflict = (required: boolean, empty: boolean): RestrictionConflict | undefined => {
	if (required && empty) {
		return {
			type: 'required-empty' as const,
			values: [required, empty],
			reason: 'required:true and empty:true cannot both be satisfied',
		};
	}
	return undefined;
};

type ResolvedNumericConstraints = {
	codeList: number[] | undefined;
	fallbackRange: RestrictionRange | undefined;
	conflicts: RestrictionConflict[];
};

type ResolvedStringConstraints = {
	codeList: string[] | undefined;
	regexPattern: string | undefined;
	conflicts: RestrictionConflict[];
};

/**
 * Resolves numeric field constraints from `collected` restrictions into the values needed by
 * `generateSingle`. Strips reference tags from codeLists, reduces multiple codeLists to their
 * intersection and multiple ranges to their tightest overlap, then cross-filters the codeList
 * against the merged range. Returns `undefined` for each output that has no active restriction.
 * `conflicts` includes reducer failures and any cross-type conflict where no codeList value
 * satisfies the range. When the cross-type conflict fires, `codeList` falls back to the
 * unfiltered list so generation can still produce a best-effort value.
 */
const resolveNumericConstraints = (codeLists: number[][], ranges: RestrictionRange[]): ResolvedNumericConstraints => {
	// ---- Ranges
	const rangeResult = reduceRanges(ranges);
	const validatedRange = rangeResult.success ? rangeResult.data : undefined;
	const fallbackRange = (rangeResult.success ? rangeResult.data : ranges[0]) ?? undefined;

	// ---- Code lists
	const codeListResult = reduceCodeLists(codeLists);
	const unrefinedCodeList = (codeListResult.success ? codeListResult.data : codeLists[0]) ?? undefined;
	const rangeFilteredList =
		unrefinedCodeList !== undefined ? filterCodeListByRange(unrefinedCodeList, validatedRange) : undefined;

	const crossTypeConflict = rangeFilteredList !== undefined && rangeFilteredList.length === 0;
	const conflicts = extractConflicts([codeListResult, rangeResult]);
	if (crossTypeConflict) {
		conflicts.push({
			type: 'codeList',
			values: [unrefinedCodeList, validatedRange],
			reason: 'No value in codeList satisfies the range restriction.',
		});
	}

	return {
		codeList: crossTypeConflict ? unrefinedCodeList : (rangeFilteredList ?? unrefinedCodeList),
		fallbackRange,
		conflicts,
	};
};

/**
 * Resolves string field constraints from `collected` restrictions into the values needed by
 * `generateSingle`. Strips reference tags from codeLists and regex entries, reduces multiple
 * codeLists to their intersection and multiple regex patterns to a lookahead conjunction, then
 * cross-filters the codeList against the merged regex. Returns `undefined` for each output that
 * has no active restriction. `conflicts` includes reducer failures and any cross-type conflict
 * where no codeList value satisfies the regex. When the cross-type conflict fires, `codeList`
 * falls back to the unfiltered list so generation can still produce a best-effort value.
 */
const resolveStringConstraints = (
	codeLists: string[][],
	regex: CollectedRestrictions['regex'],
): ResolvedStringConstraints => {
	// ---- Regex
	const concreteRegex = regex.filter((entry) => (typeof entry === 'string' ? !isReferenceTag(entry) : true));
	const regexResult = reduceRegex(concreteRegex);
	const mergedRegex = regexResult.success ? regexResult.data : undefined;
	const regexPattern = mergedRegex;

	// ---- Code lists
	const codeListResult = reduceCodeLists(codeLists);
	const unrefinedCodeList = (codeListResult.success ? codeListResult.data : codeLists[0]) ?? undefined;
	const regexFilteredList =
		unrefinedCodeList !== undefined ? filterCodeListByRegex(unrefinedCodeList, mergedRegex) : undefined;

	const crossTypeConflict = regexFilteredList !== undefined && regexFilteredList.length === 0;
	const conflicts = extractConflicts([codeListResult, regexResult]);
	if (crossTypeConflict) {
		conflicts.push({
			type: 'codeList',
			values: [unrefinedCodeList, mergedRegex],
			reason: 'No value in codeList satisfies the regex restriction.',
		});
	}

	return {
		codeList: crossTypeConflict ? unrefinedCodeList : (regexFilteredList ?? unrefinedCodeList),
		regexPattern,
		conflicts,
	};
};

/**
 * Dispatches to `generateSingle` once for scalar fields, or multiple times for array fields.
 *
 * When `isArray` is `true`, the array length is resolved from `arrayLength` (exact count, range
 * bounds, or default 1–3). Each element is generated with a unique derived seed (`seed + index + 1`)
 * so that elements within the same array are distinct while the full array remains reproducible.
 *
 * If any element generation returns a failure, all element conflicts are collected and the function
 * returns a single failure result whose value is the array of best-effort element values.
 */
const wrapArrayIfNeeded = <TElement extends SingleDataValue>(
	generateSingle: (elementSeed: number) => FieldGeneratorResult<TElement>,
	isArray: boolean | undefined,
	seed: number,
	arrayLength: number | RestrictionRange | undefined,
): FieldGeneratorResult<DataRecordValue> => {
	if (!isArray) {
		return generateSingle(seed);
	}

	const count = resolveArrayLength(arrayLength, seed);
	const results = Array.from({ length: count }, (_, index) => generateSingle(seed + index + 1));

	const allConflicts = results.flatMap((result) => (result.success ? [] : result.data.conflicts));

	// Type Assertion Justification:
	// Each element is TElement (boolean | number | string). The array is homogeneous at runtime
	// because each generator passes a concrete type (e.g. boolean, number, string), making the
	// resulting TElement[] a valid boolean[] | number[] | string[]. TypeScript cannot prove this
	// from the generic bound alone, so we assert to DataRecordValue here.
	const values = results.map((result) => (result.success ? result.data : result.data.value)) as DataRecordValue;

	if (allConflicts.length > 0) {
		return failWith('Array element generation encountered conflicting restrictions.', {
			value: values,
			conflicts: allConflicts,
		});
	}
	return success(values);
};

/* ************************** *
 * Boolean Generator          *
 * ************************** */

const generateBooleanSingleValue = (seed: number): boolean => sampleFCGenerator(fc.boolean(), seed);

/**
 * Generates a valid value for a `SchemaBooleanField`.
 *
 * Returns `FieldGeneratorResult`. On success, `result.data` is a `boolean`, or a `boolean[]` when
 * `field.isArray` is `true`. Array length is controlled by `options.arrayLength`; defaults to 1–3.
 *
 * Active restrictions are resolved from `field.restrictions` using the provided `record` to evaluate
 * any conditional branches. `required` and `empty` restrictions do not constrain the generated value,
 * but `required: true` combined with `empty: true` is a conflict that produces a failure result.
 * See `docs/resolving-restrictions.md` for full details.
 */
export const generateBooleanValue: FieldGenerator<SchemaBooleanField> = (
	field,
	options = {},
): FieldGeneratorResult<DataRecordValue> => {
	const { seed = randomSeed(), record = {}, arrayLength, emptyRate } = options;
	const collected = collectRestrictions(field.restrictions, record);
	const required = reduceRequired(collected.required);
	const empty = reduceEmpty(collected.empty);

	const resolvedEmptyRate = Math.min(1, Math.max(0, emptyRate ?? DEFAULT_EMPTY_RATE));
	if (!required && shouldGenerateEmpty(seed, resolvedEmptyRate)) {
		return success(undefined);
	}

	const requiredEmptyConflict = buildRequiredEmptyConflict(required, empty);

	// Generates one value for a scalar field or one element of an array field; called by wrapArrayIfNeeded.
	const generateSingle = (elementSeed: number): FieldGeneratorResult<boolean> => {
		const value = generateBooleanSingleValue(elementSeed);
		if (requiredEmptyConflict !== undefined) {
			return failWith('Field has conflicting required:true and empty:true restrictions.', {
				value,
				conflicts: [requiredEmptyConflict],
			});
		}
		return success(value);
	};

	return wrapArrayIfNeeded(generateSingle, field.isArray, seed, arrayLength);
};

/* ************************** *
 * Numeric Generator (shared) *
 * ************************** */

const INTEGER_FALLBACK_MIN = Number.MIN_SAFE_INTEGER;
const INTEGER_FALLBACK_MAX = Number.MAX_SAFE_INTEGER;

const NUMBER_FALLBACK_MIN = -1_000_000;
const NUMBER_FALLBACK_MAX = 1_000_000;

const integerFromRange = (range: RestrictionRange | undefined, seed: number): number => {
	const min = range?.min ?? (range?.exclusiveMin !== undefined ? range.exclusiveMin + 1 : INTEGER_FALLBACK_MIN);
	const max = range?.max ?? (range?.exclusiveMax !== undefined ? range.exclusiveMax - 1 : INTEGER_FALLBACK_MAX);
	return sampleFCGenerator(fc.integer({ min, max }), seed);
};

const numberFromRange = (range: RestrictionRange | undefined, seed: number): number => {
	const min = Math.fround(range?.min ?? range?.exclusiveMin ?? NUMBER_FALLBACK_MIN);
	const max = Math.fround(range?.max ?? range?.exclusiveMax ?? NUMBER_FALLBACK_MAX);
	const minExcluded = range?.exclusiveMin !== undefined;
	const maxExcluded = range?.exclusiveMax !== undefined;
	return sampleFCGenerator(fc.float({ min, max, minExcluded, maxExcluded, noNaN: true }), seed);
};

const generateNumericValue = (
	field: SchemaIntegerField | SchemaNumberField,
	options: FieldGeneratorOptions,
	fromRange: (range: RestrictionRange | undefined, seed: number) => number,
): FieldGeneratorResult<DataRecordValue> => {
	const { seed = randomSeed(), record = {}, arrayLength, emptyRate } = options;
	const collected = collectRestrictions(field.restrictions, record);
	const required = reduceRequired(collected.required);
	const empty = reduceEmpty(collected.empty);

	const resolvedEmptyRate = Math.min(1, Math.max(0, emptyRate ?? DEFAULT_EMPTY_RATE));
	if (!required && shouldGenerateEmpty(seed, resolvedEmptyRate)) {
		return success(undefined);
	}
	// Filter each code list to only numeric values. We expect it to only contain reference tags and numbers, so this will clear unused reference tags.
	const numericCodeLists = collected.codeList
		.map((list) => list.filter((entry): entry is number => typeof entry === 'number'))
		.filter((list) => list.length > 0);
	const {
		codeList,
		fallbackRange,
		conflicts: constraintConflicts,
	} = resolveNumericConstraints(numericCodeLists, collected.range);
	const requiredEmptyConflict = buildRequiredEmptyConflict(required, empty);
	const conflicts =
		requiredEmptyConflict !== undefined ? [...constraintConflicts, requiredEmptyConflict] : constraintConflicts;

	// Generates one value for a scalar field or one element of an array field; called by wrapArrayIfNeeded.
	const generateSingle = (elementSeed: number): FieldGeneratorResult<number> => {
		if (codeList !== undefined && codeList.length > 0) {
			const value = sampleFCGenerator(fc.constantFrom(...codeList), elementSeed);
			return conflicts.length > 0 ?
					failWith('Conflicting restrictions; value generated from merged codeList.', {
						value,
						conflicts,
					})
				:	success(value);
		}

		const value = fromRange(fallbackRange, elementSeed);
		return conflicts.length > 0 ?
				failWith('Conflicting restrictions; value generated from fallback range.', {
					value,
					conflicts,
				})
			:	success(value);
	};

	return wrapArrayIfNeeded(generateSingle, field.isArray, seed, arrayLength);
};

/* ************************** *
 * Integer Generator          *
 * ************************** */

/**
 * Generates a valid value for a `SchemaIntegerField`.
 *
 * Returns `FieldGeneratorResult`. On success, `result.data` is an integer `number`, or a `number[]`
 * of integers when `field.isArray` is `true`. Array length is controlled by `options.arrayLength`;
 * defaults to 1–3.
 *
 * Active restrictions are resolved from `field.restrictions` using the provided `record` to evaluate
 * any conditional branches, then merged across all active `codeList` and `range` entries before
 * generation. Contradictory restrictions produce a failure result with a best-effort fallback value.
 * See `docs/resolving-restrictions.md` for full details.
 */
export const generateIntegerValue: FieldGenerator<SchemaIntegerField> = (
	field,
	options = {},
): FieldGeneratorResult<DataRecordValue> => generateNumericValue(field, options, integerFromRange);

/* ************************** *
 * Number Generator           *
 * ************************** */

/**
 * Generates a valid value for a `SchemaNumberField`.
 *
 * Returns `FieldGeneratorResult`. On success, `result.data` is a `number` (may be floating-point),
 * or a `number[]` when `field.isArray` is `true`. Array length is controlled by `options.arrayLength`;
 * defaults to 1–3.
 *
 * Active restrictions are resolved from `field.restrictions` using the provided `record` to evaluate
 * any conditional branches, then merged across all active `codeList` and `range` entries before
 * generation. Contradictory restrictions produce a failure result with a best-effort fallback value.
 * See `docs/resolving-restrictions.md` for full details.
 */
export const generateNumberValue: FieldGenerator<SchemaNumberField> = (
	field,
	options = {},
): FieldGeneratorResult<DataRecordValue> => generateNumericValue(field, options, numberFromRange);

/* ************************** *
 * String Generator           *
 * ************************** */

/**
 * Generates a valid value for a `SchemaStringField`.
 *
 * Returns `FieldGeneratorResult`. On success, `result.data` is a `string`, or a `string[]` when
 * `field.isArray` is `true`. Array length is controlled by `options.arrayLength`; defaults to 1–3.
 *
 * Active restrictions are resolved from `field.restrictions` using the provided `record` to evaluate
 * any conditional branches, then merged across all active `codeList` and `regex` entries before
 * generation. Contradictory restrictions produce a failure result with a best-effort fallback value.
 * See `docs/resolving-restrictions.md` for full details.
 */
export const generateStringValue: FieldGenerator<SchemaStringField> = (
	field,
	options = {},
): FieldGeneratorResult<DataRecordValue> => {
	const { seed = randomSeed(), record = {}, arrayLength, emptyRate } = options;
	const collected = collectRestrictions(field.restrictions, record);
	const required = reduceRequired(collected.required);
	const empty = reduceEmpty(collected.empty);

	const resolvedEmptyRate = Math.min(1, Math.max(0, emptyRate ?? DEFAULT_EMPTY_RATE));
	if (!required && shouldGenerateEmpty(seed, resolvedEmptyRate)) {
		return success(undefined);
	}
	// Filter string lists to only include string values, and remove reference tags. We only expect string values but the types are permissive to support numeric code lists, this filters out that edge case.
	const stringCodeLists = collected.codeList
		.map((list) => list.filter((entry): entry is string => typeof entry === 'string' && !isReferenceTag(entry)))
		.filter((list) => list.length > 0);
	const {
		codeList,
		regexPattern,
		conflicts: constraintConflicts,
	} = resolveStringConstraints(stringCodeLists, collected.regex);
	const requiredEmptyConflict = buildRequiredEmptyConflict(required, empty);
	const conflicts =
		requiredEmptyConflict !== undefined ? [...constraintConflicts, requiredEmptyConflict] : constraintConflicts;

	// Generates one value for a scalar field or one element of an array field; called by wrapArrayIfNeeded.
	const generateSingle = (elementSeed: number): FieldGeneratorResult<string> => {
		if (codeList !== undefined && codeList.length > 0) {
			const value = sampleFCGenerator(fc.constantFrom(...codeList), elementSeed);
			return conflicts.length > 0 ?
					failWith('Conflicting restrictions; value generated from merged codeList.', {
						value,
						conflicts,
					})
				:	success(value);
		}

		if (regexPattern !== undefined) {
			const value = sampleFCGenerator(fc.stringMatching(new RegExp(regexPattern)), elementSeed);
			return conflicts.length > 0 ?
					failWith('Conflicting restrictions; value generated from regex.', {
						value,
						conflicts,
					})
				:	success(value);
		}

		const value = sampleFCGenerator(fc.string({ minLength: 1, maxLength: 20 }), elementSeed);
		return conflicts.length > 0 ?
				failWith('Conflicting restrictions; value generated without restrictions.', {
					value,
					conflicts,
				})
			:	success(value);
	};

	return wrapArrayIfNeeded(generateSingle, field.isArray, seed, arrayLength);
};

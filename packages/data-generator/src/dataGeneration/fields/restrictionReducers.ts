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
	type RestrictionRange,
	type RestrictionRegex,
	type Result,
} from '@overture-stack/lectern-dictionary';

/**
 * The conflict data returned in the failure case of a restriction reducer. Describes which
 * restriction values could not be reconciled and why.
 */
export type RestrictionConflict = {
	type: 'codeList' | 'range' | 'required-empty';
	values: unknown[];
	reason: string;
};

/**
 * Result type for restriction reducers. On success, carries the single merged restriction value.
 * On failure, carries a `RestrictionConflict` describing what could not be reconciled.
 */
export type RestrictionReducerResult<T> = Result<T, RestrictionConflict>;

/* ************************** *
 * Boolean reducers           *
 * ************************** */

/**
 * Reduces a list of `required` restriction values to a single boolean. Multiple `true` values are
 * treated as equivalent — `required: true` if any entry is true, `false` otherwise.
 * An empty list returns `false`.
 *
 * This reducer cannot produce a conflict on its own; the `required`/`empty` conflict is detected
 * at the field level after both are reduced independently.
 */
export const reduceRequired = (values: boolean[]): boolean =>
	values.length > 0 ? values.some((value) => value) : false;

/**
 * Reduces a list of `empty` restriction values to a single boolean. Multiple `true` values are
 * treated as equivalent — `empty: true` if any entry is true, `false` otherwise.
 * An empty list returns `false`.
 *
 * This reducer cannot produce a conflict on its own; the `required`/`empty` conflict is detected
 * at the field level after both are reduced independently.
 */
export const reduceEmpty = (values: boolean[]): boolean => (values.length > 0 ? values.some((value) => value) : false);

/* ************************** *
 * CodeList reducer           *
 * ************************** */

/**
 * Reduces a list of codeLists to the single intersection of all lists.
 *
 * - Zero lists: returns `success(undefined)` — no restriction applies.
 * - One list: returns `success(list)` unchanged.
 * - Multiple lists: returns `success(intersection)` when the intersection is non-empty.
 *   Returns a failure with `type: 'codeList'` when the intersection is empty, meaning no value
 *   can satisfy all lists simultaneously. The failure carries a `data` field (the conflict) but no
 *   fallback value — the caller is responsible for choosing a fallback from the input lists.
 */
export const reduceCodeLists = <T extends string | number>(lists: T[][]): RestrictionReducerResult<T[] | undefined> => {
	if (lists.length === 0) {
		return success(undefined);
	}
	if (lists.length === 1) {
		return success(lists[0]);
	}

	const [first, ...rest] = lists;
	const restSets = rest.map((list) => new Set(list));
	const intersection = (first ?? []).filter((value) => restSets.every((set) => set.has(value)));

	if (intersection.length === 0) {
		return failWith('codeLists have no common values.', {
			type: 'codeList',
			values: lists,
			reason: `codeLists have no common values: ${lists.map((list) => JSON.stringify(list)).join(', ')}`,
		});
	}

	return success(intersection);
};

/* ************************** *
 * Range reducer              *
 * ************************** */

/**
 * Reduces a list of range restrictions to the tightest overlapping subrange.
 *
 * - Zero ranges: returns `success(undefined)` — no restriction applies.
 * - One range: returns `success(range)` unchanged.
 * - Multiple ranges: returns `success(merged)` where `merged` is the intersection of all ranges.
 *   The lower bound is the highest lower bound across all ranges, and the upper bound is the lowest
 *   upper bound. Exclusive bounds are preferred over inclusive when they are equal.
 *   Returns a failure with `type: 'range'` when the resulting range is empty (lower bound exceeds
 *   upper bound, or they are equal with at least one exclusive side).
 */
export const reduceRanges = (ranges: RestrictionRange[]): RestrictionReducerResult<RestrictionRange | undefined> => {
	if (ranges.length === 0) {
		return success(undefined);
	}
	if (ranges.length === 1) {
		return success(ranges[0]);
	}

	let low: number | undefined;
	let high: number | undefined;
	let lowExclusive = false;
	let highExclusive = false;

	for (const range of ranges) {
		const rangeLow = range.min ?? range.exclusiveMin;
		const rangeHigh = range.max ?? range.exclusiveMax;
		const rangeLowExclusive = range.exclusiveMin !== undefined;
		const rangeHighExclusive = range.exclusiveMax !== undefined;

		if (rangeLow !== undefined) {
			if (low === undefined || rangeLow > low || (rangeLow === low && rangeLowExclusive && !lowExclusive)) {
				low = rangeLow;
				lowExclusive = rangeLowExclusive;
			}
		}
		if (rangeHigh !== undefined) {
			if (high === undefined || rangeHigh < high || (rangeHigh === high && rangeHighExclusive && !highExclusive)) {
				high = rangeHigh;
				highExclusive = rangeHighExclusive;
			}
		}
	}

	// Empty implies no possible values in the range, when lower bound is greater than upper bound.
	const isEmpty =
		low !== undefined && high !== undefined && (low > high || (low === high && (lowExclusive || highExclusive)));

	if (isEmpty) {
		return failWith('Ranges have no overlapping values.', {
			type: 'range',
			values: ranges,
			reason: `Ranges have no overlapping values: ${ranges.map((range) => JSON.stringify(range)).join(', ')}`,
		});
	}

	const merged: RestrictionRange = {};
	if (low !== undefined) {
		if (lowExclusive) {
			merged.exclusiveMin = low;
		} else {
			merged.min = low;
		}
	}
	if (high !== undefined) {
		if (highExclusive) {
			merged.exclusiveMax = high;
		} else {
			merged.max = high;
		}
	}

	return success(merged);
};

/* ************************** *
 * Cross-type filters         *
 * ************************** */

/**
 * Returns `true` if `value` falls within all bounds specified by `range`. Handles inclusive (`min`,
 * `max`) and exclusive (`exclusiveMin`, `exclusiveMax`) bounds independently.
 */
export const satisfiesRange = (value: number, range: RestrictionRange): boolean => {
	if (range.min !== undefined && value < range.min) {
		return false;
	}
	if (range.max !== undefined && value > range.max) {
		return false;
	}
	if (range.exclusiveMin !== undefined && value <= range.exclusiveMin) {
		return false;
	}
	if (range.exclusiveMax !== undefined && value >= range.exclusiveMax) {
		return false;
	}
	return true;
};

/**
 * Filters a numeric code list to values that satisfy `range`. Returns the full list unchanged when
 * `range` is `undefined`. Returns an empty array when no values satisfy the range — the caller is
 * responsible for treating this as a conflict.
 */
export const filterCodeListByRange = (codeList: number[], range: RestrictionRange | undefined): number[] => {
	if (range === undefined) {
		return codeList;
	}
	return codeList.filter((entry) => satisfiesRange(entry, range));
};

/**
 * Filters a string code list to values that match `regex`. Returns the full list unchanged when
 * `regex` is `undefined`. Returns an empty array when no values match — the caller is responsible
 * for treating this as a conflict.
 */
export const filterCodeListByRegex = (codeList: string[], regex: RestrictionRegex | undefined): string[] => {
	if (regex === undefined) {
		return codeList;
	}
	const pattern = Array.isArray(regex) ? regex.join('') : regex;
	const compiled = new RegExp(pattern);
	return codeList.filter((entry) => compiled.test(entry));
};

/* ************************** *
 * Regex reducer              *
 * ************************** */

/**
 * Reduces a list of regex restrictions to a single combined pattern using lookahead conjunction.
 *
 * - Zero patterns: returns `success(undefined)` — no restriction applies.
 * - One pattern: returns `success(pattern)` unchanged.
 * - Multiple patterns: wraps each in a non-capturing lookahead `(?=pattern)` and concatenates them
 *   into a single string. The result matches strings that satisfy all patterns simultaneously.
 *
 * This reducer always succeeds — syntactic combination is always possible. However, the combined
 * pattern may be semantically impossible to satisfy (e.g. `/^a/` AND `/^b/`). Detection of such
 * impossibility is deferred to generation time, where fast-check will throw if it cannot produce
 * a conforming string.
 *
 * Each input may be a single pattern string or an array of pattern strings. Arrays are flattened
 * before combination.
 */
export const reduceRegex = (patterns: RestrictionRegex[]): RestrictionReducerResult<RestrictionRegex | undefined> => {
	const allPatterns = patterns.flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));

	if (allPatterns.length === 0) {
		return success(undefined);
	}
	if (allPatterns.length === 1) {
		return success(allPatterns[0]);
	}

	return success(allPatterns.map((pattern) => `(?=${pattern})`).join(''));
};

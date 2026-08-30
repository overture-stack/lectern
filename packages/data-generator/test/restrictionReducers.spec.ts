/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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

import assert from 'node:assert';
import {
	reduceCodeLists,
	reduceEmpty,
	reduceRanges,
	reduceRegex,
	reduceRequired,
} from '../src/dataGeneration/restrictionReducers';

describe('reduceRequired', () => {
	it('returns false for an empty list', () => {
		assert.strictEqual(reduceRequired([]), false);
	});

	it('returns true when any value is true', () => {
		assert.strictEqual(reduceRequired([false, true, false]), true);
	});

	it('returns false when all values are false', () => {
		assert.strictEqual(reduceRequired([false, false]), false);
	});

	it('returns true for a single true value', () => {
		assert.strictEqual(reduceRequired([true]), true);
	});
});

describe('reduceEmpty', () => {
	it('returns false for an empty list', () => {
		assert.strictEqual(reduceEmpty([]), false);
	});

	it('returns true when any value is true', () => {
		assert.strictEqual(reduceEmpty([false, true]), true);
	});

	it('returns false when all values are false', () => {
		assert.strictEqual(reduceEmpty([false, false]), false);
	});
});

describe('reduceCodeLists', () => {
	it('returns success(undefined) for zero lists', () => {
		const result = reduceCodeLists([]);
		assert.ok(result.success);
		assert.strictEqual(result.data, undefined);
	});

	it('returns success with the single list unchanged', () => {
		const list = ['a', 'b', 'c'];
		const result = reduceCodeLists([list]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, list);
	});

	it('returns the intersection of two overlapping lists', () => {
		const result = reduceCodeLists([
			['a', 'b', 'c'],
			['b', 'c', 'd'],
		]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, ['b', 'c']);
	});

	it('returns the intersection of three overlapping lists', () => {
		const result = reduceCodeLists([
			['a', 'b', 'c', 'd'],
			['b', 'c', 'd', 'e'],
			['c', 'd', 'e', 'f'],
		]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, ['c', 'd']);
	});

	it('returns failure when two lists have no common values', () => {
		const result = reduceCodeLists([
			['a', 'b'],
			['c', 'd'],
		]);
		assert.ok(!result.success);
		assert.strictEqual(result.data.type, 'codeList');
	});

	it('returns failure when the intersection becomes empty across three lists', () => {
		const result = reduceCodeLists([
			['a', 'b'],
			['a', 'c'],
			['b', 'c'],
		]);
		assert.ok(!result.success);
		assert.strictEqual(result.data.type, 'codeList');
	});

	it('works with numeric code lists', () => {
		const result = reduceCodeLists([
			[1, 2, 3],
			[2, 3, 4],
		]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, [2, 3]);
	});
});

describe('reduceRanges', () => {
	it('returns success(undefined) for zero ranges', () => {
		const result = reduceRanges([]);
		assert.ok(result.success);
		assert.strictEqual(result.data, undefined);
	});

	it('returns success with the single range unchanged', () => {
		const range = { min: 0, max: 10 };
		const result = reduceRanges([range]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, range);
	});

	it('returns the overlapping subrange of two inclusive ranges', () => {
		const result = reduceRanges([
			{ min: 0, max: 10 },
			{ min: 5, max: 15 },
		]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, { min: 5, max: 10 });
	});

	it('returns the tightest subrange across three ranges', () => {
		const result = reduceRanges([
			{ min: 0, max: 20 },
			{ min: 5, max: 15 },
			{ min: 8, max: 12 },
		]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, { min: 8, max: 12 });
	});

	it('prefers exclusive bound when inclusive and exclusive bounds are equal', () => {
		const result = reduceRanges([{ min: 5 }, { exclusiveMin: 5 }]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, { exclusiveMin: 5 });
	});

	it('returns failure when two ranges do not overlap', () => {
		const result = reduceRanges([
			{ min: 0, max: 5 },
			{ min: 10, max: 20 },
		]);
		assert.ok(!result.success);
		assert.strictEqual(result.data.type, 'range');
	});

	it('returns failure when bounds are equal but both exclusive sides', () => {
		const result = reduceRanges([{ max: 5 }, { exclusiveMin: 5 }]);
		assert.ok(!result.success);
		assert.strictEqual(result.data.type, 'range');
	});

	it('returns failure when lower bound exceeds upper bound', () => {
		const result = reduceRanges([{ min: 10 }, { max: 5 }]);
		assert.ok(!result.success);
		assert.strictEqual(result.data.type, 'range');
	});

	it('handles ranges with only a lower bound', () => {
		const result = reduceRanges([{ min: 0 }, { min: 5 }]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, { min: 5 });
	});

	it('handles ranges with only an upper bound', () => {
		const result = reduceRanges([{ max: 10 }, { max: 5 }]);
		assert.ok(result.success);
		assert.deepStrictEqual(result.data, { max: 5 });
	});
});

describe('reduceRegex', () => {
	it('returns success(undefined) for zero patterns', () => {
		const result = reduceRegex([]);
		assert.ok(result.success);
		assert.strictEqual(result.data, undefined);
	});

	it('returns the single pattern unchanged', () => {
		const pattern = '^[A-Z]+$';
		const result = reduceRegex([pattern]);
		assert.ok(result.success);
		assert.strictEqual(result.data, pattern);
	});

	it('combines two patterns using lookaheads', () => {
		const result = reduceRegex(['^[A-Z]', '\\d{4}$']);
		assert.ok(result.success);
		assert.strictEqual(result.data, '(?=^[A-Z])(?=\\d{4}$)');
	});

	it('flattens array patterns before combining', () => {
		const result = reduceRegex([['^[A-Z]', '\\d$'], '^[A-Z]\\d']);
		assert.ok(result.success);
		assert.strictEqual(result.data, '(?=^[A-Z])(?=\\d$)(?=^[A-Z]\\d)');
	});

	it('always succeeds even when patterns are semantically incompatible', () => {
		// ^a and ^b can never both match, but the reducer still succeeds
		const result = reduceRegex(['^a', '^b']);
		assert.ok(result.success);
		assert.ok(typeof result.data === 'string');
	});
});

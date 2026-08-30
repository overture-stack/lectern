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

import assert from 'node:assert';
import {
	generateBooleanValue,
	generateIntegerValue,
	generateNumberValue,
	generateStringValue,
} from '../src/dataGeneration/fields/fieldGenerators';

const SEED = 42;
// Tests that assert on concrete value types must opt out of the default empty rate.
const NO_EMPTY = { emptyRate: 0 } as const;

describe('generateBooleanValue', () => {
	const baseField = { name: 'active', valueType: 'boolean' } as const;

	it('returns a boolean', () => {
		const result = generateBooleanValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.strictEqual(typeof result.data, 'boolean');
	});

	it('returns an array of booleans when isArray is true', () => {
		const result = generateBooleanValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.ok(Array.isArray(result.data));
		for (const element of result.data as boolean[]) {
			assert.strictEqual(typeof element, 'boolean');
		}
	});

	it('returns the same value for the same seed', () => {
		const first = generateBooleanValue(baseField, { seed: SEED, ...NO_EMPTY });
		const second = generateBooleanValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.deepStrictEqual(first, second);
	});
});

describe('generateIntegerValue', () => {
	const baseField = { name: 'count', valueType: 'integer' } as const;

	it('returns an integer', () => {
		const result = generateIntegerValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.ok(typeof result.data === 'number' && Number.isInteger(result.data));
	});

	it('returns an array of integers when isArray is true', () => {
		const result = generateIntegerValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.ok(Array.isArray(result.data));
		for (const element of result.data as number[]) {
			assert.ok(typeof element === 'number' && Number.isInteger(element));
		}
	});

	it('returns an array of the specified length when arrayLength is a number', () => {
		const result = generateIntegerValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY, arrayLength: 5 });
		assert.ok(result.success);
		assert.ok(Array.isArray(result.data));
		assert.strictEqual((result.data as number[]).length, 5);
	});

	it('returns an array whose length falls within a range when arrayLength is a RestrictionRange', () => {
		for (let seed = 0; seed < 10; seed++) {
			const result = generateIntegerValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { min: 4, max: 6 } },
			);
			assert.ok(result.success);
			const length = (result.data as number[]).length;
			assert.ok(length >= 4 && length <= 6, `array length ${length} outside [4, 6]`);
		}
	});

	it('derives integer array length correctly from fractional exclusiveMin', () => {
		for (let seed = 0; seed < 10; seed++) {
			const result = generateIntegerValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { exclusiveMin: 2.5, max: 6 } },
			);
			assert.ok(result.success);
			const length = (result.data as number[]).length;
			assert.ok(length >= 3 && length <= 6, `array length ${length} outside [3, 6]`);
		}
	});

	it('derives integer array length correctly from fractional exclusiveMax', () => {
		for (let seed = 0; seed < 10; seed++) {
			const result = generateIntegerValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { min: 1, exclusiveMax: 4.7 } },
			);
			assert.ok(result.success);
			const length = (result.data as number[]).length;
			assert.ok(length >= 1 && length <= 4, `array length ${length} outside [1, 4]`);
		}
	});

	it('returns a single-element array when exclusive integer bounds leave no valid length', () => {
		// exclusiveMin: 1, exclusiveMax: 2 → min=2, max=1 after arithmetic — impossible integer range.
		// The guard should return DEFAULT_ARRAY_MIN (1) instead of throwing.
		for (let seed = 0; seed < 10; seed++) {
			const result = generateIntegerValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { exclusiveMin: 1, exclusiveMax: 2 } },
			);
			assert.ok(result.success);
			assert.ok(Array.isArray(result.data));
			assert.strictEqual((result.data as number[]).length, 1);
		}
	});

	it('returns a value from codeList when codeList restriction is present', () => {
		const codeList = [10, 20, 30];
		const field = { ...baseField, restrictions: { codeList } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateIntegerValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			assert.ok(codeList.includes(result.data as number), `${result.data} not in codeList`);
		}
	});

	it('returns a value within range when range restriction is present', () => {
		const field = { ...baseField, restrictions: { range: { min: 5, max: 10 } } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateIntegerValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value >= 5 && value <= 10, `${value} outside [5, 10]`);
		}
	});

	it('respects exclusiveMin and exclusiveMax', () => {
		const field = { ...baseField, restrictions: { range: { exclusiveMin: 0, exclusiveMax: 5 } } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateIntegerValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value >= 1 && value <= 4, `${value} outside (0, 5)`);
		}
	});

	it('applies the then branch of a conditional restriction when the condition passes', () => {
		const field = {
			...baseField,
			restrictions: {
				if: { conditions: [{ fields: ['status'], match: { value: 'active' } }] },
				then: { range: { min: 100, max: 200 } },
				else: { range: { min: 0, max: 10 } },
			},
		};
		const activeResult = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY, record: { status: 'active' } });
		assert.ok(activeResult.success);
		const valueWhenActive = activeResult.data as number;
		assert.ok(valueWhenActive >= 100 && valueWhenActive <= 200, `${valueWhenActive} not in [100, 200]`);

		const inactiveResult = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY, record: { status: 'inactive' } });
		assert.ok(inactiveResult.success);
		const valueWhenInactive = inactiveResult.data as number;
		assert.ok(valueWhenInactive >= 0 && valueWhenInactive <= 10, `${valueWhenInactive} not in [0, 10]`);
	});

	it('treats missing condition fields as undefined, taking the else branch', () => {
		const field = {
			...baseField,
			restrictions: {
				if: { conditions: [{ fields: ['status'], match: { exists: true } }] },
				then: { range: { min: 100, max: 200 } },
				else: { range: { min: 0, max: 10 } },
			},
		};
		const result = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY, record: {} });
		assert.ok(result.success);
		const value = result.data as number;
		assert.ok(value >= 0 && value <= 10, `${value} not in else range [0, 10]`);
	});

	it('takes the then branch when case:any and at least one condition passes', () => {
		const field = {
			...baseField,
			restrictions: {
				if: {
					case: 'any' as const,
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { range: { min: 100, max: 200 } },
				else: { range: { min: 0, max: 10 } },
			},
		};
		const result = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY, record: { a: 'no', b: 'yes' } });
		assert.ok(result.success);
		const value = result.data as number;
		assert.ok(value >= 100 && value <= 200, `${value} not in then range [100, 200]`);
	});

	it('takes the then branch when case:none and no condition passes', () => {
		const field = {
			...baseField,
			restrictions: {
				if: {
					case: 'none' as const,
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { range: { min: 100, max: 200 } },
				else: { range: { min: 0, max: 10 } },
			},
		};
		const result = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY, record: { a: 'no', b: 'no' } });
		assert.ok(result.success);
		const value = result.data as number;
		assert.ok(value >= 100 && value <= 200, `${value} not in then range [100, 200]`);
	});

	it('returns a value within the intersection when two compatible ranges are present', () => {
		const field = {
			...baseField,
			restrictions: [{ range: { min: 0, max: 20 } }, { range: { min: 10, max: 30 } }],
		};
		for (let seed = 0; seed < 20; seed++) {
			const result = generateIntegerValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value >= 10 && value <= 20, `${value} outside intersection [10, 20]`);
		}
	});

	it('returns success with a fallback value when multiple ranges conflict', () => {
		const field = {
			...baseField,
			restrictions: [{ range: { min: 0, max: 5 } }, { range: { min: 10, max: 20 } }],
		};
		const result = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure due to conflicting ranges');
		assert.strictEqual(result.data.conflicts[0]?.type, 'range');
		assert.ok(typeof result.data.value === 'number', 'fallback value should still be a number');
	});

	it('returns a value satisfying both codeList and range when they are compatible', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: [1, 5, 10, 50] }, { range: { min: 5, max: 15 } }],
		};
		for (let seed = 0; seed < 20; seed++) {
			const result = generateIntegerValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok([5, 10].includes(value), `${value} not in intersection of codeList and range`);
		}
	});

	it('returns failure when no codeList value satisfies the range', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: [1, 2, 3] }, { range: { min: 10, max: 20 } }],
		};
		const result = generateIntegerValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure because no codeList value is in range');
		assert.ok(typeof result.data.value === 'number', 'fallback value should still be a number');
		assert.ok([1, 2, 3].includes(result.data.value as number), 'fallback value should come from the codeList');
	});

	it('returns the same value for the same seed', () => {
		const first = generateIntegerValue(baseField, { seed: SEED, ...NO_EMPTY });
		const second = generateIntegerValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.deepStrictEqual(first, second);
	});
});

describe('generateNumberValue', () => {
	const baseField = { name: 'score', valueType: 'number' } as const;

	it('returns a number', () => {
		const result = generateNumberValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.strictEqual(typeof result.data, 'number');
	});

	it('returns an array of numbers when isArray is true', () => {
		const result = generateNumberValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.ok(Array.isArray(result.data));
		for (const element of result.data as number[]) {
			assert.strictEqual(typeof element, 'number');
		}
	});

	it('returns an array of the specified length when arrayLength is a number', () => {
		const result = generateNumberValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY, arrayLength: 7 });
		assert.ok(result.success);
		assert.strictEqual((result.data as number[]).length, 7);
	});

	it('returns an array whose length falls within a range when arrayLength is a RestrictionRange', () => {
		for (let seed = 0; seed < 10; seed++) {
			const result = generateNumberValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { min: 2, max: 4 } },
			);
			assert.ok(result.success);
			const length = (result.data as number[]).length;
			assert.ok(length >= 2 && length <= 4, `array length ${length} outside [2, 4]`);
		}
	});

	it('returns a value from codeList when codeList restriction is present', () => {
		const codeList = [1.1, 2.2, 3.3];
		const field = { ...baseField, restrictions: { codeList } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateNumberValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			assert.ok(codeList.includes(result.data as number), `${result.data} not in codeList`);
		}
	});

	it('returns a value within range when range restriction is present', () => {
		const field = { ...baseField, restrictions: { range: { min: 0, max: 1 } } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateNumberValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value >= 0 && value <= 1, `${value} outside [0, 1]`);
		}
	});

	it('respects exclusiveMin and exclusiveMax', () => {
		const field = { ...baseField, restrictions: { range: { exclusiveMin: 0, exclusiveMax: 1 } } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateNumberValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value > 0 && value < 1, `${value} outside (0, 1)`);
		}
	});

	it('returns a value within the intersection when two compatible ranges are present', () => {
		const field = {
			...baseField,
			restrictions: [{ range: { min: 0, max: 10 } }, { range: { min: 5, max: 20 } }],
		};
		for (let seed = 0; seed < 20; seed++) {
			const result = generateNumberValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(value >= 5 && value <= 10, `${value} outside intersection [5, 10]`);
		}
	});

	it('returns failure with a fallback value when multiple ranges conflict', () => {
		const field = {
			...baseField,
			restrictions: [{ range: { min: 0, max: 5 } }, { range: { min: 10, max: 20 } }],
		};
		const result = generateNumberValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure due to conflicting ranges');
		assert.strictEqual(result.data.conflicts[0]?.type, 'range');
		assert.ok(typeof result.data.value === 'number', 'fallback value should still be a number');
	});

	it('applies conditional restriction branch based on record', () => {
		const field = {
			...baseField,
			restrictions: {
				if: { conditions: [{ fields: ['category'], match: { value: 'high' } }] },
				then: { range: { min: 10, max: 20 } },
				else: { range: { min: 0, max: 5 } },
			},
		};
		const highResult = generateNumberValue(field, { seed: SEED, ...NO_EMPTY, record: { category: 'high' } });
		assert.ok(highResult.success);
		const high = highResult.data as number;
		assert.ok(high >= 10 && high <= 20, `${high} not in [10, 20]`);

		const lowResult = generateNumberValue(field, { seed: SEED, ...NO_EMPTY, record: { category: 'low' } });
		assert.ok(lowResult.success);
		const low = lowResult.data as number;
		assert.ok(low >= 0 && low <= 5, `${low} not in [0, 5]`);
	});

	it('returns success with a fallback value when multiple codeLists conflict', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: [1.1, 2.2] }, { codeList: [3.3, 4.4] }],
		};
		const result = generateNumberValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure due to disjoint codeLists');
		assert.strictEqual(result.data.conflicts[0]?.type, 'codeList');
		assert.ok(typeof result.data.value === 'number', 'fallback value should still be a number');
	});

	it('returns a value satisfying both codeList and range when they are compatible', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: [0.5, 1.5, 5.0, 10.0] }, { range: { min: 1, max: 6 } }],
		};
		const validValues = [1.5, 5.0];
		for (let seed = 0; seed < 20; seed++) {
			const result = generateNumberValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			const value = result.data as number;
			assert.ok(validValues.includes(value), `${value} not in intersection of codeList and range`);
		}
	});

	it('returns failure when no codeList value satisfies the range', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: [0.1, 0.5, 0.9] }, { range: { min: 5, max: 10 } }],
		};
		const result = generateNumberValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure because no codeList value is in range');
		assert.ok(typeof result.data.value === 'number', 'fallback value should still be a number');
		assert.ok([0.1, 0.5, 0.9].includes(result.data.value as number), 'fallback value should come from the codeList');
	});

	it('returns the same value for the same seed', () => {
		const first = generateNumberValue(baseField, { seed: SEED, ...NO_EMPTY });
		const second = generateNumberValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.deepStrictEqual(first, second);
	});
});

describe('generateStringValue', () => {
	const baseField = { name: 'label', valueType: 'string' } as const;

	it('returns a string', () => {
		const result = generateStringValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.strictEqual(typeof result.data, 'string');
	});

	it('returns an array of strings when isArray is true', () => {
		const result = generateStringValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.ok(Array.isArray(result.data));
		for (const element of result.data as string[]) {
			assert.strictEqual(typeof element, 'string');
		}
	});

	it('returns an array of the specified length when arrayLength is a number', () => {
		const result = generateStringValue({ ...baseField, isArray: true }, { seed: SEED, ...NO_EMPTY, arrayLength: 4 });
		assert.ok(result.success);
		assert.strictEqual((result.data as string[]).length, 4);
	});

	it('returns an array whose length falls within a range when arrayLength is a RestrictionRange', () => {
		for (let seed = 0; seed < 10; seed++) {
			const result = generateStringValue(
				{ ...baseField, isArray: true },
				{ seed, ...NO_EMPTY, arrayLength: { min: 3, max: 5 } },
			);
			assert.ok(result.success);
			const length = (result.data as string[]).length;
			assert.ok(length >= 3 && length <= 5, `array length ${length} outside [3, 5]`);
		}
	});

	it('returns a value from codeList when codeList restriction is present', () => {
		const codeList = ['alpha', 'beta', 'gamma'];
		const field = { ...baseField, restrictions: { codeList } };
		for (let seed = 0; seed < 20; seed++) {
			const result = generateStringValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			assert.ok(codeList.includes(result.data as string), `"${result.data}" not in codeList`);
		}
	});

	it('returns a string matching the regex restriction', () => {
		const pattern = '^[A-Z]{2}\\d{4}$';
		const field = { ...baseField, restrictions: { regex: pattern } };
		const regex = new RegExp(pattern);
		for (let seed = 0; seed < 20; seed++) {
			const result = generateStringValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			assert.ok(regex.test(result.data as string), `"${result.data}" does not match ${pattern}`);
		}
	});

	it('skips ReferenceTag entries in codeList and falls back to arbitrary string', () => {
		const field = { ...baseField, restrictions: { codeList: ['#/references/codes'] } };
		const result = generateStringValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(result.success);
		assert.strictEqual(typeof result.data, 'string');
	});

	it('applies the then codeList when condition passes', () => {
		const thenList = ['yes', 'true'];
		const elseList = ['no', 'false'];
		const field = {
			...baseField,
			restrictions: {
				if: { conditions: [{ fields: ['enabled'], match: { value: true } }] },
				then: { codeList: thenList },
				else: { codeList: elseList },
			},
		};
		for (let seed = 0; seed < 10; seed++) {
			const enabledResult = generateStringValue(field, { seed, ...NO_EMPTY, record: { enabled: true } });
			assert.ok(enabledResult.success);
			assert.ok(thenList.includes(enabledResult.data as string), `"${enabledResult.data}" not in then codeList`);

			const disabledResult = generateStringValue(field, { seed, ...NO_EMPTY, record: { enabled: false } });
			assert.ok(disabledResult.success);
			assert.ok(elseList.includes(disabledResult.data as string), `"${disabledResult.data}" not in else codeList`);
		}
	});

	it('treats missing condition field as undefined, taking the else branch', () => {
		const field = {
			...baseField,
			restrictions: {
				if: { conditions: [{ fields: ['type'], match: { exists: true } }] },
				then: { codeList: ['A', 'B'] },
				else: { codeList: ['X', 'Y'] },
			},
		};
		for (let seed = 0; seed < 10; seed++) {
			const result = generateStringValue(field, { seed, ...NO_EMPTY, record: {} });
			assert.ok(result.success);
			assert.ok(['X', 'Y'].includes(result.data as string), `"${result.data}" not in else codeList`);
		}
	});

	it('returns success with a fallback value when codeLists from two conditional branches conflict', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: ['alpha', 'beta'] }, { codeList: ['gamma', 'delta'] }],
		};
		const result = generateStringValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure due to disjoint codeLists');
		assert.strictEqual(result.data.conflicts[0]?.type, 'codeList');
		assert.ok(typeof result.data.value === 'string', 'fallback value should still be a string');
	});

	it('returns a value satisfying both codeList and regex when they are compatible', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: ['abc', 'ABC', 'xyz', 'XYZ'] }, { regex: '^[A-Z]+$' }],
		};
		const validValues = ['ABC', 'XYZ'];
		for (let seed = 0; seed < 20; seed++) {
			const result = generateStringValue(field, { seed, ...NO_EMPTY });
			assert.ok(result.success);
			assert.ok(
				validValues.includes(result.data as string),
				`"${result.data}" not in intersection of codeList and regex`,
			);
		}
	});

	it('returns failure when no codeList value satisfies the regex', () => {
		const field = {
			...baseField,
			restrictions: [{ codeList: ['abc', 'xyz'] }, { regex: '^[0-9]+$' }],
		};
		const result = generateStringValue(field, { seed: SEED, ...NO_EMPTY });
		assert.ok(!result.success, 'expected failure because no codeList value matches the regex');
		assert.ok(typeof result.data.value === 'string', 'fallback value should still be a string');
		assert.ok(['abc', 'xyz'].includes(result.data.value as string), 'fallback value should come from the codeList');
	});

	it('returns the same value for the same seed', () => {
		const first = generateStringValue(baseField, { seed: SEED, ...NO_EMPTY });
		const second = generateStringValue(baseField, { seed: SEED, ...NO_EMPTY });
		assert.deepStrictEqual(first, second);
	});
});

describe('emptyRate', () => {
	const boolField = { name: 'b', valueType: 'boolean' as const, restrictions: undefined };
	const intField = { name: 'i', valueType: 'integer' as const, restrictions: undefined };
	const numField = { name: 'n', valueType: 'number' as const, restrictions: undefined };
	const strField = { name: 's', valueType: 'string' as const, restrictions: undefined };
	const requiredStrField = {
		name: 's',
		valueType: 'string' as const,
		restrictions: { required: true },
	};

	it('returns undefined for every seed when emptyRate is 1', () => {
		for (let seed = 0; seed < 20; seed++) {
			assert.strictEqual(generateBooleanValue(boolField, { seed, emptyRate: 1 }).data, undefined);
			assert.strictEqual(generateIntegerValue(intField, { seed, emptyRate: 1 }).data, undefined);
			assert.strictEqual(generateNumberValue(numField, { seed, emptyRate: 1 }).data, undefined);
			assert.strictEqual(generateStringValue(strField, { seed, emptyRate: 1 }).data, undefined);
		}
	});

	it('never returns undefined when emptyRate is 0', () => {
		for (let seed = 0; seed < 20; seed++) {
			assert.notStrictEqual(generateBooleanValue(boolField, { seed, emptyRate: 0 }).data, undefined);
			assert.notStrictEqual(generateIntegerValue(intField, { seed, emptyRate: 0 }).data, undefined);
			assert.notStrictEqual(generateNumberValue(numField, { seed, emptyRate: 0 }).data, undefined);
			assert.notStrictEqual(generateStringValue(strField, { seed, emptyRate: 0 }).data, undefined);
		}
	});

	it('never returns undefined for a required field regardless of emptyRate', () => {
		for (let seed = 0; seed < 20; seed++) {
			const result = generateStringValue(requiredStrField, { seed, emptyRate: 1 });
			assert.notStrictEqual(result.data, undefined);
		}
	});

	it('clamps emptyRate values outside [0, 1]', () => {
		for (let seed = 0; seed < 20; seed++) {
			assert.strictEqual(
				generateStringValue(strField, { seed, emptyRate: 999 }).data,
				undefined,
				'values > 1 should clamp to 1',
			);
			assert.notStrictEqual(
				generateStringValue(strField, { seed, emptyRate: -999 }).data,
				undefined,
				'values < 0 should clamp to 0',
			);
		}
	});

	it('produces undefined for approximately the expected fraction of seeds at the default rate', () => {
		const results = Array.from({ length: 200 }, (_, seed) => generateStringValue(strField, { seed }));
		const emptyCount = results.filter((result) => result.data === undefined).length;
		// With default rate 0.25 and 200 samples, expect roughly 50 ± 30 empty values.
		assert.ok(emptyCount > 20 && emptyCount < 80, `expected ~50 empty values, got ${emptyCount}`);
	});

	it('returns the same result for the same seed (empty check is reproducible)', () => {
		const first = generateStringValue(strField, { seed: SEED });
		const second = generateStringValue(strField, { seed: SEED });
		assert.deepStrictEqual(first, second);
	});
});

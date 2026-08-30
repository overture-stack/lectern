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
import { collectRestrictions } from '../src/dataGeneration/resolveRestrictions';

type StringRestrictions = {
	codeList?: (string | number)[];
	required?: boolean;
};

describe('collectRestrictions — plain restrictions', () => {
	it('returns empty collections when restrictions is undefined', () => {
		const result = collectRestrictions(undefined, {});
		assert.deepStrictEqual(result.codeList, []);
		assert.deepStrictEqual(result.required, []);
	});

	it('collects a single plain restriction object', () => {
		const result = collectRestrictions<StringRestrictions>({ required: true }, {});
		assert.deepStrictEqual(result.required, [true]);
	});

	it('collects multiple plain restriction objects from an array', () => {
		const result = collectRestrictions<StringRestrictions>([{ codeList: ['a', 'b'] }, { required: true }], {});
		assert.deepStrictEqual(result.codeList, [['a', 'b']]);
		assert.deepStrictEqual(result.required, [true]);
	});
});

describe('collectRestrictions — conditional restrictions (default case: all)', () => {
	it('takes the then branch when the condition passes', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: { conditions: [{ fields: ['status'], match: { value: 'active' } }] },
				then: { required: true },
				else: { required: false },
			},
			{ status: 'active' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('takes the else branch when the condition fails', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: { conditions: [{ fields: ['status'], match: { value: 'active' } }] },
				then: { required: true },
				else: { required: false },
			},
			{ status: 'inactive' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});

	it('treats missing condition field as undefined, failing an exists:true check', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: { conditions: [{ fields: ['status'], match: { exists: true } }] },
				then: { required: true },
				else: { required: false },
			},
			{},
		);
		assert.deepStrictEqual(result.required, [false]);
	});
});

describe('collectRestrictions — condition case: any', () => {
	it('passes when at least one of multiple condition fields matches', () => {
		// case:'any' on conditions: passes if any condition is true
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					case: 'any',
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'yes' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('fails when none of the conditions match under case: any', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					case: 'any',
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});
});

describe('collectRestrictions — condition case: none', () => {
	it('passes when none of the conditions match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					case: 'none',
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('fails when any condition matches under case: none', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					case: 'none',
					conditions: [
						{ fields: ['a'], match: { value: 'yes' } },
						{ fields: ['b'], match: { value: 'yes' } },
					],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'yes', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});
});

describe('collectRestrictions — condition.case across multiple fields', () => {
	it('case:any — passes when at least one named field satisfies the match', () => {
		// condition.case governs how results across multiple fields are combined.
		// With case:'any', the condition passes if any of the listed fields matches.
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' }, case: 'any' }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'yes' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('case:any — fails when no named field satisfies the match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' }, case: 'any' }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});

	it('case:none — passes when no named field satisfies the match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' }, case: 'none' }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'no', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('case:none — fails when any named field satisfies the match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' }, case: 'none' }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'yes', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});

	it('case:all (default) — passes only when all named fields satisfy the match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' } }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'yes', b: 'yes' },
		);
		assert.deepStrictEqual(result.required, [true]);
	});

	it('case:all (default) — fails when any named field does not satisfy the match', () => {
		const result = collectRestrictions<StringRestrictions>(
			{
				if: {
					conditions: [{ fields: ['a', 'b'], match: { value: 'yes' } }],
				},
				then: { required: true },
				else: { required: false },
			},
			{ a: 'yes', b: 'no' },
		);
		assert.deepStrictEqual(result.required, [false]);
	});
});

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
import { describe, it } from 'mocha';
import type { Schema } from '@overture-stack/lectern-dictionary';
import { extractFieldDependencies, resolveGenerationOrder } from '../src/dataGeneration/records/fieldDependencies';

describe('extractFieldDependencies', () => {
	it('returns empty sets for all fields when no conditional restrictions are present', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{ name: 'beta', valueType: 'string', restrictions: undefined },
				{ name: 'gamma', valueType: 'string', restrictions: undefined },
			],
		};

		const dependencyMap = extractFieldDependencies(schema);
		assert.deepStrictEqual(dependencyMap.get('alpha'), new Set());
		assert.deepStrictEqual(dependencyMap.get('beta'), new Set());
		assert.deepStrictEqual(dependencyMap.get('gamma'), new Set());
	});

	it('captures a simple linear dependency: beta depends on alpha', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'x' } }] },
							then: { codeList: ['yes'] },
							else: { codeList: ['no'] },
						},
					],
				},
			],
		};

		const dependencyMap = extractFieldDependencies(schema);
		assert.deepStrictEqual(dependencyMap.get('alpha'), new Set());
		assert.deepStrictEqual(dependencyMap.get('beta'), new Set(['alpha']));
	});

	it('captures field names from nested conditional branches', () => {
		// 'outer' conditionally references 'first'; its then-branch itself conditionally references 'inner'.
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'first', valueType: 'string', restrictions: undefined },
				{ name: 'inner', valueType: 'string', restrictions: undefined },
				{
					name: 'outer',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['first'], match: { value: 'a' } }] },
							then: [
								{
									if: { conditions: [{ fields: ['inner'], match: { value: 'b' } }] },
									then: { codeList: ['deep'] },
								},
							],
						},
					],
				},
			],
		};

		const dependencyMap = extractFieldDependencies(schema);
		assert.deepStrictEqual(dependencyMap.get('outer'), new Set(['first', 'inner']));
	});

	it('excludes references to fields not defined in the schema', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{
					name: 'alpha',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['unknown'], match: { value: 'x' } }] },
							then: { codeList: ['yes'] },
						},
					],
				},
			],
		};

		const dependencyMap = extractFieldDependencies(schema);
		assert.deepStrictEqual(dependencyMap.get('alpha'), new Set());
	});

	it('excludes self-references', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{
					name: 'alpha',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'x' } }] },
							then: { codeList: ['yes'] },
						},
					],
				},
			],
		};

		const dependencyMap = extractFieldDependencies(schema);
		assert.deepStrictEqual(dependencyMap.get('alpha'), new Set());
	});
});

describe('resolveGenerationOrder', () => {
	it('flattens fields with no dependencies into a single tier', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{ name: 'beta', valueType: 'string', restrictions: undefined },
				{ name: 'gamma', valueType: 'string', restrictions: undefined },
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 1);
		assert.deepStrictEqual(new Set(order[0]), new Set(['alpha', 'beta', 'gamma']));
	});

	it('produces two tiers for a linear dependency: alpha first, then beta', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'x' } }] },
							then: { codeList: ['yes'] },
						},
					],
				},
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 2);
		assert.deepStrictEqual(order[0], ['alpha']);
		assert.deepStrictEqual(order[1], ['beta']);
	});

	it('produces three tiers for a chain: alpha → beta → gamma', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'x' } }] },
							then: { codeList: ['b'] },
						},
					],
				},
				{
					name: 'gamma',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['beta'], match: { value: 'b' } }] },
							then: { codeList: ['c'] },
						},
					],
				},
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 3);
		assert.deepStrictEqual(order[0], ['alpha']);
		assert.deepStrictEqual(order[1], ['beta']);
		assert.deepStrictEqual(order[2], ['gamma']);
	});

	it('produces two tiers for a fan-in: alpha and beta in the same tier, gamma after', () => {
		// gamma depends on both alpha and beta, which are independent of each other.
		const schema: Schema = {
			name: 'test',
			fields: [
				{ name: 'alpha', valueType: 'string', restrictions: undefined },
				{ name: 'beta', valueType: 'string', restrictions: undefined },
				{
					name: 'gamma',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha', 'beta'], match: { value: 'x' } }] },
							then: { codeList: ['c'] },
						},
					],
				},
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 2);
		assert.deepStrictEqual(new Set(order[0]), new Set(['alpha', 'beta']));
		assert.deepStrictEqual(order[1], ['gamma']);
	});

	it('places both fields in one tier when there is a two-field cycle', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{
					name: 'alpha',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['beta'], match: { value: 'b' } }] },
							then: { codeList: ['a'] },
						},
					],
				},
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'a' } }] },
							then: { codeList: ['b'] },
						},
					],
				},
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 1);
		assert.deepStrictEqual(new Set(order[0]), new Set(['alpha', 'beta']));
	});

	it('places all three fields in one tier when there is a three-field cycle', () => {
		const schema: Schema = {
			name: 'test',
			fields: [
				{
					name: 'alpha',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['gamma'], match: { value: 'c' } }] },
							then: { codeList: ['a'] },
						},
					],
				},
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'a' } }] },
							then: { codeList: ['b'] },
						},
					],
				},
				{
					name: 'gamma',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['beta'], match: { value: 'b' } }] },
							then: { codeList: ['c'] },
						},
					],
				},
			],
		};

		const order = resolveGenerationOrder(schema);
		assert.strictEqual(order.length, 1);
		assert.deepStrictEqual(new Set(order[0]), new Set(['alpha', 'beta', 'gamma']));
	});

	it('correctly orders fields when the dependent appears before its dependency in schema.fields', () => {
		// beta (index 0) depends on alpha (index 1). Generation order must be alpha before beta
		// even though beta comes first in schema.fields.
		const schema: Schema = {
			name: 'test',
			fields: [
				{
					name: 'beta',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['alpha'], match: { value: 'x' } }] },
							then: { codeList: ['yes'] },
							else: { codeList: ['no'] },
						},
					],
				},
				{ name: 'alpha', valueType: 'string', restrictions: { codeList: ['x', 'y'] } },
			],
		};

		const order = resolveGenerationOrder(schema);
		const alphaPosition = order.findIndex((tier) => tier.includes('alpha'));
		const betaPosition = order.findIndex((tier) => tier.includes('beta'));
		assert.ok(alphaPosition < betaPosition, 'alpha must be in an earlier tier than beta');
	});
});

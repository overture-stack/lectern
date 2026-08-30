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
import { generateRecord, type ForeignKeyPool } from '../src/dataGeneration/records/recordGenerator';

const SEED = 42;
const NO_EMPTY = { emptyRate: 0 } as const;

const schema: Schema = {
	name: 'test',
	fields: [
		{ name: 'boolField', valueType: 'boolean', restrictions: undefined },
		{ name: 'intField', valueType: 'integer', restrictions: undefined },
		{ name: 'numField', valueType: 'number', restrictions: undefined },
		{ name: 'strField', valueType: 'string', restrictions: undefined },
	],
};

const schemaWithRestrictions: Schema = {
	name: 'restricted',
	fields: [
		{
			name: 'status',
			valueType: 'string',
			restrictions: { codeList: ['active', 'inactive', 'pending'] },
		},
		{
			name: 'score',
			valueType: 'integer',
			restrictions: { range: { min: 0, max: 100 } },
		},
		{
			name: 'rating',
			valueType: 'number',
			restrictions: { range: { min: 0, max: 5 } },
		},
	],
};

const schemaWithConditional: Schema = {
	name: 'conditional',
	fields: [
		{
			name: 'type',
			valueType: 'string',
			restrictions: { codeList: ['A', 'B'] },
		},
		{
			name: 'label',
			valueType: 'string',
			restrictions: [
				{
					if: { conditions: [{ fields: ['type'], match: { value: 'A' } }] },
					then: { codeList: ['alpha'] },
					else: { codeList: ['beta'] },
				},
			],
		},
	],
};

describe('generateRecord', () => {
	it('returns a record with a key for every field in the schema', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		for (const field of schema.fields) {
			assert.ok(Object.hasOwn(record, field.name), `missing field: ${field.name}`);
		}
	});

	it('generates a boolean for boolean fields', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		assert.strictEqual(typeof record['boolField'], 'boolean');
	});

	it('generates an integer number for integer fields', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		const value = record['intField'];
		assert.strictEqual(typeof value, 'number');
		assert.ok(Number.isInteger(value));
	});

	it('generates a number for number fields', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		assert.strictEqual(typeof record['numField'], 'number');
	});

	it('generates a string for string fields', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		assert.strictEqual(typeof record['strField'], 'string');
	});

	it('respects codeList restrictions', () => {
		const record = generateRecord(schemaWithRestrictions, { seed: SEED, ...NO_EMPTY });
		assert.ok(['active', 'inactive', 'pending'].includes(record['status'] as string));
	});

	it('respects range restrictions on integer fields', () => {
		const record = generateRecord(schemaWithRestrictions, { seed: SEED, ...NO_EMPTY });
		const score = record['score'] as number;
		assert.ok(score >= 0 && score <= 100);
	});

	it('respects range restrictions on number fields', () => {
		const record = generateRecord(schemaWithRestrictions, { seed: SEED, ...NO_EMPTY });
		const rating = record['rating'] as number;
		assert.ok(rating >= 0 && rating <= 5);
	});

	it('uses override values directly without generating', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY, overrides: { strField: 'forced' } });
		assert.strictEqual(record['strField'], 'forced');
	});

	it('does not overwrite non-overridden fields', () => {
		const record = generateRecord(schema, { seed: SEED, ...NO_EMPTY, overrides: { strField: 'forced' } });
		assert.strictEqual(typeof record['boolField'], 'boolean');
		assert.strictEqual(typeof record['intField'], 'number');
	});

	it('produces identical records for the same seed', () => {
		const first = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		const second = generateRecord(schema, { seed: SEED, ...NO_EMPTY });
		assert.deepStrictEqual(first, second);
	});

	it('produces different records for different seeds', () => {
		const records = Array.from({ length: 10 }, (_, index) => generateRecord(schema, { seed: index, ...NO_EMPTY }));
		const serialized = records.map((record) => JSON.stringify(record));
		const unique = new Set(serialized);
		assert.ok(unique.size > 1, 'expected at least some records to differ across seeds');
	});

	it('threads the partial record into later field generators for conditional restriction resolution', () => {
		// label's codeList depends on the value of type, which is generated first.
		// With a fixed seed, the same type value is always generated, so the conditional
		// always resolves the same way. We run both branches by fixing the override.
		const recordWithTypeA = generateRecord(schemaWithConditional, {
			seed: SEED,
			...NO_EMPTY,
			overrides: { type: 'A' },
		});
		assert.strictEqual(recordWithTypeA['label'], 'alpha');

		const recordWithTypeB = generateRecord(schemaWithConditional, {
			seed: SEED,
			...NO_EMPTY,
			overrides: { type: 'B' },
		});
		assert.strictEqual(recordWithTypeB['label'], 'beta');
	});

	it('works with a schema that has no restrictions', () => {
		assert.doesNotThrow(() => generateRecord(schema));
	});

	describe('foreignKeyPool', () => {
		const childSchema: Schema = {
			name: 'sample',
			fields: [
				{ name: 'donor_id', valueType: 'string', restrictions: undefined },
				{ name: 'sample_type', valueType: 'string', restrictions: undefined },
			],
			restrictions: {
				foreignKey: [
					{
						schema: 'donor',
						mappings: [{ local: 'donor_id', foreign: 'id' }],
					},
				],
			},
		};

		const compositeFkSchema: Schema = {
			name: 'sample',
			fields: [
				{ name: 'donor_id', valueType: 'string', restrictions: undefined },
				{ name: 'program_id', valueType: 'string', restrictions: undefined },
				{ name: 'sample_type', valueType: 'string', restrictions: undefined },
			],
			restrictions: {
				foreignKey: [
					{
						schema: 'donor',
						mappings: [
							{ local: 'donor_id', foreign: 'id' },
							{ local: 'program_id', foreign: 'program' },
						],
					},
				],
			},
		};

		it('assigns the FK local field from the matching foreign field in the selected parent row', () => {
			const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }]]]);
			const record = generateRecord(childSchema, { seed: SEED, ...NO_EMPTY, foreignKeyPool: pool });
			assert.strictEqual(record['donor_id'], 'D001');
		});

		it('assigns all local fields in a composite FK rule from the same selected parent row', () => {
			const pool: ForeignKeyPool = new Map([
				[
					'donor',
					[
						{ id: 'D001', program: 'PROG-A' },
						{ id: 'D002', program: 'PROG-B' },
					],
				],
			]);
			const record = generateRecord(compositeFkSchema, { seed: SEED, ...NO_EMPTY, foreignKeyPool: pool });
			const donorId = record['donor_id'];
			const programId = record['program_id'];
			// Both fields must come from the same row.
			assert.ok(
				(donorId === 'D001' && programId === 'PROG-A') || (donorId === 'D002' && programId === 'PROG-B'),
				`donor_id=${String(donorId)} and program_id=${String(programId)} do not belong to the same parent row`,
			);
		});

		it('generates the FK field normally when no pool entry exists for the parent schema', () => {
			const pool: ForeignKeyPool = new Map();
			const record = generateRecord(childSchema, { seed: SEED, ...NO_EMPTY, foreignKeyPool: pool });
			assert.strictEqual(typeof record['donor_id'], 'string');
		});

		it('produces identical records for the same seed when a pool is provided', () => {
			const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }, { id: 'D002' }, { id: 'D003' }]]]);
			const first = generateRecord(childSchema, { seed: SEED, ...NO_EMPTY, foreignKeyPool: pool });
			const second = generateRecord(childSchema, { seed: SEED, ...NO_EMPTY, foreignKeyPool: pool });
			assert.deepStrictEqual(first, second);
		});

		it('explicit overrides take priority over FK pool values', () => {
			const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }]]]);
			const record = generateRecord(childSchema, {
				seed: SEED,
				foreignKeyPool: pool,
				overrides: { donor_id: 'OVERRIDE' },
			});
			assert.strictEqual(record['donor_id'], 'OVERRIDE');
		});
	});

	it('correctly resolves conditional restrictions when the dependent field appears before its dependency in schema.fields', () => {
		// 'label' (index 0) has a conditional restriction referencing 'type' (index 1).
		// Without dependency ordering, 'type' would be generated after 'label', so the conditional
		// would always evaluate against an incomplete record. With ordering, 'type' is generated first.
		const schemaWithReversedOrder: Schema = {
			name: 'reversed',
			fields: [
				{
					name: 'label',
					valueType: 'string',
					restrictions: [
						{
							if: { conditions: [{ fields: ['type'], match: { value: 'A' } }] },
							then: { codeList: ['alpha'] },
							else: { codeList: ['beta'] },
						},
					],
				},
				{
					name: 'type',
					valueType: 'string',
					restrictions: { codeList: ['A', 'B'] },
				},
			],
		};

		const recordWithTypeA = generateRecord(schemaWithReversedOrder, {
			seed: SEED,
			...NO_EMPTY,
			overrides: { type: 'A' },
		});
		assert.strictEqual(recordWithTypeA['label'], 'alpha');

		const recordWithTypeB = generateRecord(schemaWithReversedOrder, {
			seed: SEED,
			...NO_EMPTY,
			overrides: { type: 'B' },
		});
		assert.strictEqual(recordWithTypeB['label'], 'beta');
	});
});

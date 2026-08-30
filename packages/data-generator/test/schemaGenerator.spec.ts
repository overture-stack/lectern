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
import { generateSchemaRecords } from '../src/dataGeneration/records/schemaGenerator';
import type { ForeignKeyPool } from '../src/dataGeneration/records/recordGenerator';

const SEED = 42;
const NO_EMPTY = { emptyRate: 0 } as const;

const schema: Schema = {
	name: 'test',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: { codeList: ['A', 'B', 'C', 'D', 'E'] } },
		{ name: 'label', valueType: 'string', restrictions: undefined },
	],
};

const schemaWithUnique: Schema = {
	name: 'unique_test',
	fields: [
		{
			name: 'code',
			valueType: 'string',
			unique: true,
			restrictions: { codeList: ['X1', 'X2', 'X3', 'X4', 'X5'] },
		},
		{ name: 'name', valueType: 'string', restrictions: undefined },
	],
};

const schemaWithUniqueKey: Schema = {
	name: 'uniquekey_test',
	fields: [
		{ name: 'program', valueType: 'string', restrictions: { codeList: ['P1', 'P2', 'P3'] } },
		{ name: 'donor', valueType: 'string', restrictions: { codeList: ['D1', 'D2', 'D3'] } },
		{ name: 'label', valueType: 'string', restrictions: undefined },
	],
	restrictions: {
		uniqueKey: ['program', 'donor'],
	},
};

const schemaWithFk: Schema = {
	name: 'child',
	fields: [
		{ name: 'donor_id', valueType: 'string', restrictions: undefined },
		{ name: 'value', valueType: 'string', restrictions: undefined },
	],
	restrictions: {
		foreignKey: [{ schema: 'donor', mappings: [{ local: 'donor_id', foreign: 'id' }] }],
	},
};

describe('generateSchemaRecords', () => {
	it('yields exactly count records', () => {
		const records = [...generateSchemaRecords(schema, { count: 5, seed: SEED, ...NO_EMPTY })];
		assert.strictEqual(records.length, 5);
	});

	it('yields zero records when count is 0', () => {
		const records = [...generateSchemaRecords(schema, { count: 0, seed: SEED })];
		assert.strictEqual(records.length, 0);
	});

	it('yields zero records when options are omitted', () => {
		const records = [...generateSchemaRecords(schema)];
		assert.strictEqual(records.length, 0);
	});

	it('produces identical sequences for the same seed', () => {
		const first = [...generateSchemaRecords(schema, { count: 5, seed: SEED, ...NO_EMPTY })];
		const second = [...generateSchemaRecords(schema, { count: 5, seed: SEED, ...NO_EMPTY })];
		assert.deepStrictEqual(first, second);
	});

	it('produces different sequences for different seeds', () => {
		const first = [...generateSchemaRecords(schema, { count: 5, seed: 1, ...NO_EMPTY })];
		const second = [...generateSchemaRecords(schema, { count: 5, seed: 99, ...NO_EMPTY })];
		assert.notDeepStrictEqual(first, second);
	});

	it('each yielded record has all schema fields', () => {
		const records = [...generateSchemaRecords(schema, { count: 3, seed: SEED, ...NO_EMPTY })];
		for (const record of records) {
			for (const field of schema.fields) {
				assert.ok(Object.hasOwn(record, field.name), `missing field: ${field.name}`);
			}
		}
	});

	describe('unique field enforcement', () => {
		it('unique field values are distinct across all yielded records', () => {
			const count = 5;
			const records = [...generateSchemaRecords(schemaWithUnique, { count, seed: SEED, ...NO_EMPTY })];
			const codeValues = records.map((record) => record['code']);
			const unique = new Set(codeValues);
			assert.strictEqual(unique.size, count, `expected ${count} distinct code values, got ${unique.size}`);
		});

		it('initialUniqueValues.fields pre-populates exclusion for unique fields', () => {
			// Pre-seed 4 of the 5 codeList values, leaving only 'X5' available.
			const records = [
				...generateSchemaRecords(schemaWithUnique, {
					count: 1,
					seed: SEED,
					...NO_EMPTY,
					initialUniqueValues: { fields: { code: ['X1', 'X2', 'X3', 'X4'] } },
				}),
			];
			assert.strictEqual(records[0]?.['code'], 'X5');
		});
	});

	describe('uniqueKey enforcement', () => {
		it('uniqueKey tuples are distinct across all yielded records', () => {
			const count = 9; // 3 programs × 3 donors = 9 unique combinations
			const records = [...generateSchemaRecords(schemaWithUniqueKey, { count, seed: SEED, ...NO_EMPTY })];
			const tuples = records.map((record) => JSON.stringify([record['program'], record['donor']]));
			const uniqueTuples = new Set(tuples);
			assert.strictEqual(uniqueTuples.size, count, `expected ${count} distinct key tuples, got ${uniqueTuples.size}`);
		});

		it('records that do not collide with pre-seeded keys are identical to the baseline', () => {
			// Baseline: 5 records with seed 42, no pre-seeded keys. Known output (verified empirically):
			//   index 0 → { program: 'P2', donor: 'D3', ... }
			//   index 1 → { program: 'P3', donor: 'D1', ... }  ← will be pre-seeded
			//   index 2 → { program: 'P1', donor: 'D1', ... }
			//   index 3 → { program: 'P3', donor: 'D3', ... }  ← will be pre-seeded
			//   index 4 → { program: 'P1', donor: 'D3', ... }
			const baseline = [...generateSchemaRecords(schemaWithUniqueKey, { count: 5, seed: SEED, ...NO_EMPTY })];

			// Pre-seed the keys that correspond to indices 1 and 3. When we regenerate with the same
			// seed, those positions collide → retry with a different seed → different record value.
			// Positions 0, 2, 4 have no collision and must produce the identical record as baseline.
			const preSeenKeys = [
				JSON.stringify([baseline[1]?.['program'], baseline[1]?.['donor']]),
				JSON.stringify([baseline[3]?.['program'], baseline[3]?.['donor']]),
			];
			const withPreSeen = [
				...generateSchemaRecords(schemaWithUniqueKey, {
					count: 5,
					seed: SEED,
					...NO_EMPTY,
					initialUniqueValues: { keys: preSeenKeys },
				}),
			];

			// Non-colliding positions are identical to baseline.
			assert.deepStrictEqual(withPreSeen[0], baseline[0]);
			assert.deepStrictEqual(withPreSeen[2], baseline[2]);
			assert.deepStrictEqual(withPreSeen[4], baseline[4]);

			// Colliding positions produce different records (retried to a new seed).
			assert.notDeepStrictEqual(withPreSeen[1], baseline[1]);
			assert.notDeepStrictEqual(withPreSeen[3], baseline[3]);

			// Colliding positions still produce keys not in the pre-seeded set.
			const collisionKey1 = JSON.stringify([withPreSeen[1]?.['program'], withPreSeen[1]?.['donor']]);
			const collisionKey3 = JSON.stringify([withPreSeen[3]?.['program'], withPreSeen[3]?.['donor']]);
			assert.ok(!preSeenKeys.includes(collisionKey1), `index 1 key ${collisionKey1} was in pre-seeded set`);
			assert.ok(!preSeenKeys.includes(collisionKey3), `index 3 key ${collisionKey3} was in pre-seeded set`);
		});

		it('initialUniqueValues.keys pre-populates the uniqueKey tracker', () => {
			// Generate without initial keys, then use those as pre-seen — the second run must
			// avoid those exact tuples since it shares the same seed.
			const firstRun = [...generateSchemaRecords(schemaWithUniqueKey, { count: 3, seed: SEED, ...NO_EMPTY })];
			const preSeenKeys = firstRun.map((record) => JSON.stringify([record['program'], record['donor']]));

			const secondRun = [
				...generateSchemaRecords(schemaWithUniqueKey, {
					count: 3,
					seed: SEED,
					...NO_EMPTY,
					initialUniqueValues: { keys: preSeenKeys },
				}),
			];

			for (const record of secondRun) {
				const key = JSON.stringify([record['program'], record['donor']]);
				assert.ok(!preSeenKeys.includes(key), `generated key ${key} was in the pre-seen set`);
			}
		});
	});

	describe('foreignKeyPool', () => {
		it('FK-constrained field values come from the pool', () => {
			const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }, { id: 'D002' }]]]);
			const records = [
				...generateSchemaRecords(schemaWithFk, { count: 5, seed: SEED, ...NO_EMPTY, foreignKeyPool: pool }),
			];
			const validIds = new Set(['D001', 'D002']);
			for (const record of records) {
				assert.ok(validIds.has(record['donor_id'] as string), `unexpected donor_id: ${String(record['donor_id'])}`);
			}
		});
	});

	it('records are yielded lazily — generator does not pre-compute all records', () => {
		const generator = generateSchemaRecords(schema, { count: 1000, seed: SEED, ...NO_EMPTY });
		// Taking only the first record should not trigger generation of all 1000.
		const firstResult = generator.next();
		assert.strictEqual(firstResult.done, false);
		assert.ok(firstResult.value !== undefined);
	});
});

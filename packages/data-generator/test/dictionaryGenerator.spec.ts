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
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { generateDictionaryRecords } from '../src/dataGeneration/dictionary/dictionaryGenerator';

const SEED = 42;
const NO_EMPTY = { emptyRate: 0 } as const;

const donorSchema = {
	name: 'donor',
	fields: [
		{ name: 'id', valueType: 'string' as const, unique: true, restrictions: undefined },
		{ name: 'program', valueType: 'string' as const, restrictions: { codeList: ['P1', 'P2', 'P3'] } },
	],
};

const sampleSchema = {
	name: 'sample',
	fields: [
		{ name: 'sample_id', valueType: 'string' as const, unique: true, restrictions: undefined },
		{ name: 'donor_id', valueType: 'string' as const, restrictions: undefined },
		{ name: 'type', valueType: 'string' as const, restrictions: { codeList: ['T1', 'T2'] } },
	],
	restrictions: {
		foreignKey: [{ schema: 'donor', mappings: [{ local: 'donor_id', foreign: 'id' }] }],
	},
};

const standaloneSchema = {
	name: 'project',
	fields: [{ name: 'code', valueType: 'string' as const, restrictions: { codeList: ['A', 'B', 'C'] } }],
};

const dictionary: Dictionary = {
	name: 'test-dictionary',
	version: '1.0',
	schemas: [donorSchema, sampleSchema, standaloneSchema],
};

const collectBySchema = (
	generator: Generator<{ schemaName: string; record: Record<string, unknown> }>,
): Record<string, Record<string, unknown>[]> => {
	const result: Record<string, Record<string, unknown>[]> = {};
	for (const { schemaName, record } of generator) {
		(result[schemaName] ??= []).push(record);
	}
	return result;
};

describe('generateDictionaryRecords', () => {
	it('yields one tagged record at a time', () => {
		const generator = generateDictionaryRecords(dictionary, { counts: { donor: 2 }, seed: SEED, ...NO_EMPTY });
		const first = generator.next();
		assert.strictEqual(first.done, false);
		assert.ok(typeof first.value?.schemaName === 'string');
		assert.ok(typeof first.value?.record === 'object');
	});

	it('generates the correct number of records per schema', () => {
		const records = collectBySchema(
			generateDictionaryRecords(dictionary, { counts: { donor: 3, sample: 5, project: 2 }, seed: SEED, ...NO_EMPTY }),
		);
		assert.strictEqual(records['donor']?.length, 3);
		assert.strictEqual(records['sample']?.length, 5);
		assert.strictEqual(records['project']?.length, 2);
	});

	it('schemas with count 0 are not included in the output', () => {
		const records = collectBySchema(
			generateDictionaryRecords(dictionary, { counts: { donor: 3, sample: 0, project: 2 }, seed: SEED, ...NO_EMPTY }),
		);
		assert.ok(!Object.hasOwn(records, 'sample'), 'sample should not appear in output');
	});

	it('schemas absent from counts are not included in the output', () => {
		const records = collectBySchema(
			generateDictionaryRecords(dictionary, { counts: { donor: 3 }, seed: SEED, ...NO_EMPTY }),
		);
		assert.ok(!Object.hasOwn(records, 'sample'), 'sample should not appear in output');
		assert.ok(!Object.hasOwn(records, 'project'), 'project should not appear in output');
	});

	it('parent schema records are yielded before child schema records', () => {
		const yielded: string[] = [];
		for (const { schemaName } of generateDictionaryRecords(dictionary, {
			counts: { donor: 2, sample: 3 },
			seed: SEED,
			...NO_EMPTY,
		})) {
			yielded.push(schemaName);
		}
		const lastDonorIndex = yielded.lastIndexOf('donor');
		const firstSampleIndex = yielded.indexOf('sample');
		assert.ok(lastDonorIndex < firstSampleIndex, 'all donor records must be yielded before any sample records');
	});

	it('child FK fields reference values that appear in parent records', () => {
		const records = collectBySchema(
			generateDictionaryRecords(dictionary, { counts: { donor: 4, sample: 10 }, seed: SEED, ...NO_EMPTY }),
		);
		const donorIds = new Set(records['donor']?.map((record) => record['id']));
		for (const record of records['sample'] ?? []) {
			assert.ok(
				donorIds.has(record['donor_id']),
				`sample donor_id '${String(record['donor_id'])}' not found in donor ids`,
			);
		}
	});

	it('schema with no FK relationships generates independently', () => {
		const records = collectBySchema(
			generateDictionaryRecords(dictionary, { counts: { project: 5 }, seed: SEED, ...NO_EMPTY }),
		);
		assert.strictEqual(records['project']?.length, 5);
		for (const record of records['project'] ?? []) {
			assert.ok(['A', 'B', 'C'].includes(record['code'] as string), `unexpected code: ${String(record['code'])}`);
		}
	});

	describe('multi-level hierarchy', () => {
		// grandparent → parent → child: 3-tier FK chain.
		// child.parent_id must reference a parent record, and parent.grandparent_id must reference grandparent.
		const grandparentSchema = {
			name: 'grandparent',
			fields: [{ name: 'gp_id', valueType: 'string' as const, unique: true, restrictions: undefined }],
		};

		const parentSchema = {
			name: 'parent',
			fields: [
				{ name: 'p_id', valueType: 'string' as const, unique: true, restrictions: undefined },
				{ name: 'grandparent_id', valueType: 'string' as const, restrictions: undefined },
			],
			restrictions: {
				foreignKey: [{ schema: 'grandparent', mappings: [{ local: 'grandparent_id', foreign: 'gp_id' }] }],
			},
		};

		const childSchema = {
			name: 'child',
			fields: [
				{ name: 'c_id', valueType: 'string' as const, unique: true, restrictions: undefined },
				{ name: 'parent_id', valueType: 'string' as const, restrictions: undefined },
			],
			restrictions: {
				foreignKey: [{ schema: 'parent', mappings: [{ local: 'parent_id', foreign: 'p_id' }] }],
			},
		};

		const threeLayerDictionary: Dictionary = {
			name: 'three-layer',
			version: '1.0',
			schemas: [grandparentSchema, parentSchema, childSchema],
		};

		it('grandparent records are yielded before parent and child', () => {
			const yielded: string[] = [];
			for (const { schemaName } of generateDictionaryRecords(threeLayerDictionary, {
				counts: { grandparent: 2, parent: 4, child: 8 },
				seed: SEED,
				...NO_EMPTY,
			})) {
				yielded.push(schemaName);
			}
			const lastGrandparent = yielded.lastIndexOf('grandparent');
			const firstParent = yielded.indexOf('parent');
			const lastParent = yielded.lastIndexOf('parent');
			const firstChild = yielded.indexOf('child');
			assert.ok(lastGrandparent < firstParent, 'all grandparent records must come before any parent records');
			assert.ok(lastParent < firstChild, 'all parent records must come before any child records');
		});

		it('FK integrity holds across all three levels', () => {
			const records = collectBySchema(
				generateDictionaryRecords(threeLayerDictionary, {
					counts: { grandparent: 2, parent: 4, child: 8 },
					seed: SEED,
					...NO_EMPTY,
				}),
			);
			const gpIds = new Set(records['grandparent']?.map((record) => record['gp_id']));
			const parentIds = new Set(records['parent']?.map((record) => record['p_id']));
			for (const record of records['parent'] ?? []) {
				assert.ok(
					gpIds.has(record['grandparent_id']),
					`parent.grandparent_id '${String(record['grandparent_id'])}' not in grandparent ids`,
				);
			}
			for (const record of records['child'] ?? []) {
				assert.ok(
					parentIds.has(record['parent_id']),
					`child.parent_id '${String(record['parent_id'])}' not in parent ids`,
				);
			}
		});
	});

	describe('cyclic FK dependencies', () => {
		// Schema A has a FK to B, and B has a FK to A — a cycle.
		// The generator must not hang or throw; it should place both schemas in one tier
		// and generate records for both (FK constraints in the cycle will not be enforced
		// since neither can be a parent to the other).
		const schemaA = {
			name: 'cycle_a',
			fields: [
				{ name: 'a_id', valueType: 'string' as const, unique: true, restrictions: undefined },
				{ name: 'b_ref', valueType: 'string' as const, restrictions: undefined },
			],
			restrictions: {
				foreignKey: [{ schema: 'cycle_b', mappings: [{ local: 'b_ref', foreign: 'b_id' }] }],
			},
		};

		const schemaB = {
			name: 'cycle_b',
			fields: [
				{ name: 'b_id', valueType: 'string' as const, unique: true, restrictions: undefined },
				{ name: 'a_ref', valueType: 'string' as const, restrictions: undefined },
			],
			restrictions: {
				foreignKey: [{ schema: 'cycle_a', mappings: [{ local: 'a_ref', foreign: 'a_id' }] }],
			},
		};

		const cyclicDictionary: Dictionary = {
			name: 'cyclic',
			version: '1.0',
			schemas: [schemaA, schemaB],
		};

		it('generates the requested number of records for both schemas without hanging', () => {
			const records = collectBySchema(
				generateDictionaryRecords(cyclicDictionary, { counts: { cycle_a: 3, cycle_b: 3 }, seed: SEED, ...NO_EMPTY }),
			);
			assert.strictEqual(records['cycle_a']?.length, 3, 'expected 3 cycle_a records');
			assert.strictEqual(records['cycle_b']?.length, 3, 'expected 3 cycle_b records');
		});
	});

	it('produces identical output for the same seed', () => {
		const options = { counts: { donor: 3, sample: 5 }, seed: SEED, ...NO_EMPTY };
		const first = [...generateDictionaryRecords(dictionary, options)];
		const second = [...generateDictionaryRecords(dictionary, options)];
		assert.deepStrictEqual(first, second);
	});

	it('produces different output for different seeds', () => {
		const counts = { donor: 3, sample: 5 };
		const first = [...generateDictionaryRecords(dictionary, { counts, seed: 1, ...NO_EMPTY })];
		const second = [...generateDictionaryRecords(dictionary, { counts, seed: 99, ...NO_EMPTY })];
		assert.notDeepStrictEqual(first, second);
	});
});

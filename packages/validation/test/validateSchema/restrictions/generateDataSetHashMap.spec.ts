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

import { expect } from 'chai';
import { generateDataSetHashMap } from '../../../src/validateSchema/restrictions/generateDataSetHashMap';
import { hashDataRecord } from '../../../src/utils/hashDataRecord';
import { getUniqueKeyValues } from '../../../src/validateSchema/restrictions/uniqueKey/getUniqueKeyValues';

describe('Schema - generateDataSetHashMap', () => {
	it('It contains an entry for each record', () => {
		const records = [
			{ a: 1, b: 1, c: 1 },
			{ a: 1, b: 1, c: 1 },
			{ a: 2, b: 2, c: 2 },
			{ other: 'stuff' },
			{ more: 'other stuff' },
			{ a: 5, b: '5' },
			{ a: 'six', b: 'six', other: true },
		];
		const result = generateDataSetHashMap(records, ['a', 'b']);

		let totalEntries = 0;
		for (const value of result.values()) {
			totalEntries += value.length;
		}
		expect(totalEntries).equal(records.length);
	});
	it('It contains a different hash for every record when all different', () => {
		const records = [
			{ a: 1, b: 1, c: 1 },
			{ a: 2, b: 2, c: 2 },
			{ a: 3, b: 3, c: 3 },
			{ a: 4, b: 4, c: 4 },
			{ a: 5, b: 5, c: 5 },
			{ a: 6, b: 6, c: 6 },
		];
		const result = generateDataSetHashMap(records, ['a', 'b']);

		let keys = 0;
		for (const key of result.keys()) {
			keys++;
		}
		expect(keys).equal(records.length);
	});
	it('Duplicate records are both listed under the same hash', () => {
		const duplicateA = { a: 1, b: 1, c: 1 };
		const duplicateB = { a: 2, b: 2, c: 2 };
		const records = [
			duplicateA,
			duplicateA,
			duplicateA,
			duplicateB,
			duplicateB,
			{ a: 3, b: 3, c: 3 },
			{ a: 4, b: 4, c: 4 },
			{ a: 5, b: 5, c: 5 },
			{ a: 6, b: 6, c: 6 },
		];
		const uniqueKeyRule = ['a', 'b'];
		const result = generateDataSetHashMap(records, uniqueKeyRule);

		const hashA = hashDataRecord(getUniqueKeyValues(duplicateA, uniqueKeyRule));
		const recordA = result.get(hashA);
		expect(recordA?.length).equal(3);
		expect(recordA).contain(0);
		expect(recordA).contain(1);
		expect(recordA).contain(2);

		const hashB = hashDataRecord(getUniqueKeyValues(duplicateB, uniqueKeyRule));
		const recordB = result.get(hashB);
		expect(recordB?.length).equal(2);
		expect(recordB).contain(3);
		expect(recordB).contain(4);
	});
	it('Works with a single key', () => {
		// single key in uniqueKeyRule
		const uniqueKeyRule = ['a'];

		const duplicateA = { a: 1, b: 1, c: 1 };
		const duplicateB = { a: 2, b: 2, c: 2 };
		const records = [
			duplicateA,
			duplicateA,
			duplicateA,
			duplicateB,
			duplicateB,
			{ a: 3, b: 3, c: 3 },
			{ a: 4, b: 4, c: 4 },
			{ a: 5, b: 5, c: 5 },
			{ a: 6, b: 6, c: 6 },
		];
		const result = generateDataSetHashMap(records, uniqueKeyRule);

		const hashA = hashDataRecord(getUniqueKeyValues(duplicateA, uniqueKeyRule));
		const recordA = result.get(hashA);
		expect(recordA?.length).equal(3);
		expect(recordA).contain(0);
		expect(recordA).contain(1);
		expect(recordA).contain(2);

		const hashB = hashDataRecord(getUniqueKeyValues(duplicateB, uniqueKeyRule));
		const recordB = result.get(hashB);
		expect(recordB?.length).equal(2);
		expect(recordB).contain(3);
		expect(recordB).contain(4);
	});
});

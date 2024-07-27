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

import { expect } from 'chai';
import { hashDataRecord } from '../../src/utils/hashDataRecord';
import { expectAllValuesMatch } from '../testUtils/expectAllValuesMatch';

describe('Utils - hashDataRecord', () => {
	it('Same hash given the same object', () => {
		const object = { some: 'value' };
		const hashes = [hashDataRecord(object), hashDataRecord(object)];
		expectAllValuesMatch(hashes);
	});
	it('Same hash when properties added in different order', () => {
		const hashes = [
			hashDataRecord({ a: 1, b: '2', c: true, d: 2 }),
			hashDataRecord({ a: 1, b: '2', d: 2, c: true }),
			hashDataRecord({ a: 1, d: 2, b: '2', c: true }),
			hashDataRecord({ a: 1, d: 2, c: true, b: '2' }),
			hashDataRecord({ d: 2, a: 1, c: true, b: '2' }),
			hashDataRecord({ d: 2, a: 1, b: '2', c: true }),
			hashDataRecord({ d: 2, b: '2', a: 1, c: true }),
			hashDataRecord({ d: 2, c: true, a: 1, b: '2' }),
			hashDataRecord({ d: 2, c: true, b: '2', a: 1 }),
			hashDataRecord({ d: 2, b: '2', c: true, a: 1 }),
		];

		expectAllValuesMatch(hashes);
	});

	it('Different hash when a property is missing', () => {
		const aAndB = hashDataRecord({ a: 1, b: '2' });
		const aOnly = hashDataRecord({ a: 1 });
		expect(aAndB).not.equal(aOnly);

		const aWithBUndefined = hashDataRecord({ a: 1, b: undefined });
		expect(aAndB).not.equal(aWithBUndefined);
	});
	it('Same hash when a property is missing or set to undefined', () => {
		const hashes = [
			hashDataRecord({ a: 1 }),
			hashDataRecord({ a: 1, b: undefined }),
			hashDataRecord({ a: 1, c: undefined }),
			hashDataRecord({ a: 1, b: undefined, c: undefined }),
		];

		expectAllValuesMatch(hashes);
	});
	it('Same hash for empty objects', () => {
		const hashes = [hashDataRecord({}), hashDataRecord({})];

		expectAllValuesMatch(hashes);
	});
});

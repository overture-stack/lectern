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
import assert from 'node:assert';
import { testCodeList } from '../../../src/validateField/restrictions';
import { codeListInteger, codeListNumber, codeListString } from '../../fixtures/restrictions/codeListsFixtures';

describe('Field - Restrictions - testCodeList', () => {
	describe('Single Value', () => {
		it('Invalid when value is not in string list', () => {
			expect(testCodeList(codeListString, 'space shuttle').valid).false;
			expect(testCodeList(codeListString, 'asdfl;2309dsajlkxcnm').valid).false;
			expect(testCodeList(codeListString, 'donuts').valid).false; // extra letter
			expect(testCodeList(codeListString, 'aple').valid).false; // missing letter
			expect(testCodeList(codeListString, '').valid).false; // empty string special case
		});

		it('Invalid when value is not in integer list', () => {
			expect(testCodeList(codeListInteger, 0).valid).false; // special case 0
			expect(testCodeList(codeListInteger, 4).valid).false; // number not in list
			expect(testCodeList(codeListInteger, -1).valid).false; // negated value from list
			expect(testCodeList(codeListInteger, 13.1).valid).false; // close with decimal
		});

		it('Invalid when value is not in number list', () => {
			expect(testCodeList(codeListNumber, 1).valid).false; // close
			expect(testCodeList(codeListNumber, 1.6).valid).false; // closer
			expect(testCodeList(codeListNumber, 5.19258).valid).false; // number not in list
			expect(testCodeList(codeListNumber, -2.41421).valid).false; // negated value from list
			expect(testCodeList(codeListNumber, 3.30277).valid).false; // off by 0.00001
			expect(testCodeList(codeListNumber, NaN).valid).false; // special case NaN
			expect(testCodeList(codeListNumber, Infinity).valid).false; // special case Infinity
		});
		it('Valid when value is in string list', () => {
			expect(testCodeList(codeListString, 'Apple').valid).true;
			expect(testCodeList(codeListString, 'Banana').valid).true;
			expect(testCodeList(codeListString, 'Carrot').valid).true;
			expect(testCodeList(codeListString, 'Donut').valid).true;
		});
		it('Valid when value is in string list with different case', () => {
			expect(testCodeList(codeListString, 'apple').valid).true;
			expect(testCodeList(codeListString, 'aPpLe').valid).true;
			expect(testCodeList(codeListString, 'BANANA').valid).true;
		});
		it('Valid when value is in string list with extra whitespace', () => {
			expect(testCodeList(codeListString, '  Apple').valid).true;
			expect(testCodeList(codeListString, '  	Banana ').valid).true;
			expect(testCodeList(codeListString, 'Donut  ').valid).true;
		});
		it('Valid when value is in string list with extra whitespace and different case', () => {
			expect(testCodeList(codeListString, '  cARRoT		').valid).true;
		});
		it('Valid when value is in integer list', () => {
			expect(testCodeList(codeListInteger, 1).valid).true;
			expect(testCodeList(codeListInteger, 2).valid).true;
			expect(testCodeList(codeListInteger, 3).valid).true;
			expect(testCodeList(codeListInteger, 5).valid).true;
			expect(testCodeList(codeListInteger, 8).valid).true;
			expect(testCodeList(codeListInteger, 13).valid).true;
			expect(testCodeList(codeListInteger, 24).valid).true;
		});
		it('Valid when value is in number list', () => {
			expect(testCodeList(codeListNumber, 1.61803).valid).true;
			expect(testCodeList(codeListNumber, 2.41421).valid).true;
			expect(testCodeList(codeListNumber, 3.30278).valid).true;
			expect(testCodeList(codeListNumber, 4.23607).valid).true;
		});
		it('Valid when value is undefined', () => {
			expect(testCodeList(codeListInteger, undefined).valid).true;
			expect(testCodeList(codeListNumber, undefined).valid).true;
			expect(testCodeList(codeListString, undefined).valid).true;
		});
		it('Valid when value is not a boolean', () => {
			expect(testCodeList(codeListInteger, true).valid).true;
			expect(testCodeList(codeListNumber, false).valid).true;
		});
	});
	describe('Array Value', () => {
		it('Valid when all array items are valid', () => {
			expect(testCodeList(codeListString, ['apple', 'banana', 'apple', 'donut']).valid).true;
			expect(testCodeList(codeListInteger, [1, 1, 1, 1, 1, 5, 8, 13]).valid).true;
			expect(testCodeList(codeListNumber, [3.30278, 2.41421]).valid).true;
		});
		it('Valid when array is empty', () => {
			expect(testCodeList(codeListString, []).valid).true;
			expect(testCodeList(codeListInteger, []).valid).true;
			expect(testCodeList(codeListNumber, []).valid).true;
		});
		it('Invalid when any item is invalid', () => {
			expect(testCodeList(codeListString, ['linux', 'apple', 'turnip', 'banana', 'apple', 'donut']).valid).false;
			expect(testCodeList(codeListInteger, [1, 1, 1, 1, 1, 6, 8, 13]).valid).false;
			expect(testCodeList(codeListNumber, [12.34]).valid).false;
		});
		it('Identifies the invalid items', () => {
			const result = testCodeList(codeListString, ['linux', 'apple', 'turnip', 'banana', 'apple', 'donut']);
			expect(result.valid).false;
			assert(!result.valid);

			expect(Array.isArray(result.details.invalidItems)).true;
			assert(Array.isArray(result.details.invalidItems));

			expect(result.details.invalidItems.length).equal(2);
			expect(result.details.invalidItems[0]?.position).equal(0);
			expect(result.details.invalidItems[0]?.value).equal('linux');
			expect(result.details.invalidItems[1]?.position).equal(2);
			expect(result.details.invalidItems[1]?.value).equal('turnip');
		});
	});
});

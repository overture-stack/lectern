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
import { testRegex } from '../../../src/validateField/restrictions';
import { regexYearMonthDay } from '../../fixtures/restrictions/regexFixtures';

const validDateSingle = '1989-11-09';
const validDateArray = ['1867-07-01', '1969-07-16', '1989-12-17'];

describe('Field - Restrictions - testRegex', () => {
	describe('Single Value', () => {
		it('Valid for matching values', () => {
			expect(testRegex(regexYearMonthDay, validDateSingle).valid).true;
		});
		it('Valid when value is undefined', () => {
			expect(testRegex(regexYearMonthDay, undefined).valid).true;
		});
		it('Valid for non-string types', () => {
			expect(testRegex(regexYearMonthDay, 0).valid).true;
			expect(testRegex(regexYearMonthDay, 123).valid).true;
			expect(testRegex(regexYearMonthDay, 4.56).valid).true;
			expect(testRegex(regexYearMonthDay, true).valid).true;
			expect(testRegex(regexYearMonthDay, false).valid).true;
		});
		it('Invalid for values with incorrect format', () => {
			expect(testRegex(regexYearMonthDay, 'November 9th, 1989').valid).false;
			expect(testRegex(regexYearMonthDay, '19891109').valid).false;
			expect(testRegex(regexYearMonthDay, 'random string	!&^1234').valid).false;
		});
		it('Invalid for empty string', () => {
			expect(testRegex(regexYearMonthDay, '').valid).false;
		});
	});
	describe('Array Value', () => {
		it('Valid for array of matching values', () => {
			expect(testRegex(regexYearMonthDay, validDateArray).valid).true;
			expect(testRegex(regexYearMonthDay, [...validDateArray, validDateSingle]).valid).true;
		});
		it('Valid for empty array', () => {
			expect(testRegex(regexYearMonthDay, []).valid).true;
		});
		it('Invalid when one value in array is invalid', () => {
			expect(testRegex(regexYearMonthDay, ['invalid']).valid).false;
			expect(testRegex(regexYearMonthDay, [...validDateArray, 'invalid', validDateSingle, 'another invalid']).valid)
				.false;
		});

		it('Identifies the invalid items', () => {
			const result = testRegex(regexYearMonthDay, [
				...validDateArray,
				'invalid',
				validDateSingle,
				'another invalid',
				'third invalid',
			]);
			expect(result.valid).false;
			assert(!result.valid);

			expect(Array.isArray(result.details.invalidItems)).true;
			assert(Array.isArray(result.details.invalidItems));

			expect(result.details.invalidItems.length).equal(3);
			expect(result.details.invalidItems[0]?.position).equal(validDateArray.length);
			expect(result.details.invalidItems[0]?.value).equal('invalid');
			expect(result.details.invalidItems[1]?.position).equal(validDateArray.length + 2);
			expect(result.details.invalidItems[1]?.value).equal('another invalid');
			expect(result.details.invalidItems[2]?.position).equal(validDateArray.length + 3);
			expect(result.details.invalidItems[2]?.value).equal('third invalid');
		});
	});
});

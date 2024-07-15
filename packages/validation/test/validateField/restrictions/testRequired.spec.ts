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
import { testRequired } from '../../../src/validateField/restrictions';

describe('Field - Restrictions - testRequired', () => {
	describe('Restriction is false', () => {
		it('Valid with undefined', () => {
			expect(testRequired(false, undefined).valid).true;
		});
		it('Valid with empty string', () => {
			expect(testRequired(false, '').valid).true;
		});
		it('Valid with empty array', () => {
			expect(testRequired(false, []).valid).true;
		});
		it('Valid with all value types', () => {
			// boolean + boolean[]
			expect(testRequired(false, false).valid).true;
			expect(testRequired(false, true).valid).true;
			expect(testRequired(false, [false]).valid).true;
			// string + string[]
			expect(testRequired(false, 'hello').valid).true;
			expect(testRequired(false, ['hello']).valid).true;
			// number + number[]
			expect(testRequired(false, 0).valid).true;
			expect(testRequired(false, [123]).valid).true;
		});
	});
	describe('Restriction is true', () => {
		it('Valid with any all value types', () => {
			// boolean + boolean[]
			expect(testRequired(true, false).valid).true;
			expect(testRequired(true, true).valid).true;
			expect(testRequired(true, [false]).valid).true;
			// string + string[]
			expect(testRequired(true, 'hello').valid).true;
			expect(testRequired(true, ['hello']).valid).true;
			// number + number[]
			expect(testRequired(true, 0).valid).true;
			expect(testRequired(true, [123]).valid).true;
		});
		it('Invalid with undefined', () => {
			expect(testRequired(true, undefined).valid).false;
		});
		it('Invalid with empty string', () => {
			expect(testRequired(true, '').valid).false;
		});
		it('Invalid with empty array', () => {
			expect(testRequired(true, []).valid).false;
		});
		it('Invalid with array with some missing values', () => {
			expect(testRequired(true, ['hello', '', 'world']).valid).false;
		});
	});
});

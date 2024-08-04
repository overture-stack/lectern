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
import { testMatchExists } from '../../../src/validateField/conditions/testMatchExists';

describe('ConditionalRestriction - testMatchExists', () => {
	it('Primitive values all found to exist', () => {
		expect(testMatchExists(true, 'hello')).true;
		expect(testMatchExists(true, 123)).true;
		expect(testMatchExists(true, true)).true;
	});
	it('Array values with some elements all found to exist', () => {
		expect(testMatchExists(true, ['hello'])).true;
		expect(testMatchExists(true, ['hello', 'world', 'how are you?'])).true;
		expect(testMatchExists(true, [123, 456, 789])).true;
		expect(testMatchExists(true, [true, false, true, false])).true;
	});
	it('`false` values treated as existing', () => {
		expect(testMatchExists(true, false)).true;
	});
	it('`undefined` values treated as not existing', () => {
		expect(testMatchExists(true, undefined)).false;
	});
	it('Empty string values treated as not existing', () => {
		expect(testMatchExists(true, '')).false;
	});
	it('All whitespacce string values treated as not existing', () => {
		expect(testMatchExists(true, '       ')).false;
	});
	it('Non-finite numbers (NaN, Infinity) values are treated as not existing.', () => {
		expect(testMatchExists(true, NaN)).false;
		expect(testMatchExists(true, Infinity)).false;
		expect(testMatchExists(true, -Infinity)).false;
	});
	it('Empty array value treated as not existing', () => {
		expect(testMatchExists(true, [])).false;
	});
	it('Array with only non existing elements treated as not existing', () => {
		expect(testMatchExists(true, [''])).false;
		expect(testMatchExists(true, ['', '         '])).false;
		expect(testMatchExists(true, [NaN, Infinity])).false;
	});

	it('Inverse rule - Exist rule `false` resolves `true` when value does not exist', () => {
		expect(testMatchExists(false, undefined)).true;
	});
	it('Inverse rule - Exist rule `false` resolves `false` when value exists', () => {
		expect(testMatchExists(false, 'hello')).false;
	});
});

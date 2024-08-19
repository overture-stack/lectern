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
import { testMatchValue } from '../../../src/validateField/conditions';

describe('ConditionalRestriction - testMatchValue', () => {
	it('Primitive values that match test true', () => {
		expect(testMatchValue('hello', 'hello')).true;
		expect(testMatchValue('hello world', 'hello world')).true;
		expect(testMatchValue(123, 123)).true;
		expect(testMatchValue(0, 0)).true;
		expect(testMatchValue(true, true)).true;
		expect(testMatchValue(false, false)).true;
	});
	it('Primitive values that do not match test false', () => {
		expect(testMatchValue('hello', 'goodbye')).false;
		expect(testMatchValue('hello world', 'nevermore')).false;
		expect(testMatchValue(123, 1234)).false;
		expect(testMatchValue(0, 10)).false;
		expect(testMatchValue(true, false)).false;
		expect(testMatchValue(false, true)).false;
	});
	describe('Array values', () => {
		it('Array values never match a primitive match rule', () => {
			expect(testMatchValue('hello', ['hello'])).false;
			expect(testMatchValue('hello world', ['hello world'])).false;
			expect(testMatchValue(123, [123])).false;
			expect(testMatchValue(0, [0])).false;
			expect(testMatchValue(true, [true])).false;
			expect(testMatchValue(false, [false])).false;
		});
		it('Primitive values never match an array match rule', () => {
			expect(testMatchValue(['hello'], 'hello')).false;
			expect(testMatchValue(['hello world'], 'hello world')).false;
			expect(testMatchValue([123], 123)).false;
			expect(testMatchValue([0], 0)).false;
			expect(testMatchValue([true], true)).false;
			expect(testMatchValue([false], false)).false;
		});
		it('Exact arrays teset true', () => {
			expect(testMatchValue(['hello', 'world'], ['hello', 'world'])).true;
			expect(testMatchValue(['hello world'], ['hello world'])).true;
			expect(testMatchValue([123, 456, 789], [123, 456, 789])).true;
			expect(testMatchValue([0], [0])).true;
			expect(testMatchValue([true, true, true, false], [true, true, true, false])).true;
			expect(testMatchValue([false], [false])).true;
		});
		it('Arrays with same values in different order test true', () => {
			expect(testMatchValue(['hello', 'world'], ['world', 'hello'])).true;
			expect(testMatchValue([123, 123, -456, 789], [-456, 123, 789, 123])).true;
			expect(testMatchValue([true, true, true, false, false], [false, true, false, true, true])).true;
		});
		it('Arrays with extra values test false', () => {
			expect(testMatchValue(['hello', 'world'], ['world', 'hello', 'extra'])).false;
			expect(testMatchValue([123, 123, -456, 789], [-456, 123, 789, 123, 0])).false;
			expect(testMatchValue([true, true, true, false, false], [false, true, false, true, true, true])).false;
		});
		it('Arrays with missing values test false', () => {
			expect(testMatchValue(['hello', 'world'], ['world'])).false;
			expect(testMatchValue([123, 123, -456, 789], [-456, 123, 789])).false;
			expect(testMatchValue([true, true, true, false, false], [false, true, false, true])).false;
		});
		it('Arrays different missing values test false', () => {
			expect(testMatchValue(['hello', 'world'], ['world', 'helo'])).false;
			expect(testMatchValue([123, 123, -456, 789], [-456, 124, 123, 789])).false;
			expect(testMatchValue([true, true, true, false, false], [false, true, false, true, false])).false;
		});
	});
});

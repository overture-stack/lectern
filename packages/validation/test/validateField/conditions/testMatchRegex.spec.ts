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
import { testMatchRegex } from '../../../src/validateField/conditions';
import { regexAlphaOnly, regexRepeatedText } from '../../fixtures/restrictions/regexFixtures';

describe('ConditionalRestriction - testMatchRegex', () => {
	it('Tests true with string value that matches regex', () => {
		expect(testMatchRegex(regexAlphaOnly, 'qwerty')).true;
		expect(testMatchRegex(regexRepeatedText, '123 asdf 123')).true;
	});
	it('Tests false with string value that does not matche regex', () => {
		expect(testMatchRegex(regexAlphaOnly, 'letters and spaces and numbers 123')).false;
		expect(testMatchRegex(regexRepeatedText, '123 asdf 456')).false;
	});
	it('Tests true with empty string if that passes the regex rule', () => {
		expect(testMatchRegex(regexAlphaOnly, '')).true;
	});
	it('Tests false with non-string primitive values', () => {
		expect(testMatchRegex(regexRepeatedText, 123123)).false;
		expect(testMatchRegex(regexRepeatedText, true)).false;
		expect(testMatchRegex(regexRepeatedText, undefined)).false;
	});

	it('Tests true when value is an array with at least one matching element', () => {
		expect(testMatchRegex(regexAlphaOnly, ['asdf'])).true;
		expect(testMatchRegex(regexAlphaOnly, ['asdf', '123', 'qwerty12345'])).true;
		expect(testMatchRegex(regexAlphaOnly, ['qwerty12345', '1234', 'ok', 'not ok!'])).true;
	});

	it('Tests false when value is an array with no matching elements', () => {
		expect(testMatchRegex(regexAlphaOnly, [])).false;
		expect(testMatchRegex(regexAlphaOnly, ['123', 'qwerty12345'])).false;
		expect(testMatchRegex(regexAlphaOnly, ['qwerty12345', '1234', 'not ok!'])).false;
		expect(testMatchRegex(regexAlphaOnly, [123, 456, 789])).false;
	});
});

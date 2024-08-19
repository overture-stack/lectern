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
import { testMatchCodeList } from '../../../src/validateField/conditions';

describe('ConditionalRestriction - testMatchCodeList', () => {
	it('Tests true when the primitive value matches an item in the list', () => {
		expect(testMatchCodeList(['hello', 'world'], 'hello')).true;
		expect(testMatchCodeList(['hello', 'world'], 'world')).true;
		expect(testMatchCodeList([123, 456, 789, 1011], 123)).true;
		expect(testMatchCodeList([123, 456, 789, 1011], 456)).true;
		expect(testMatchCodeList([123, 456, 789, 1011], 789)).true;
		expect(testMatchCodeList([123, 456, 789, 1011], 1011)).true;
	});
	it('Tests false when the primitive value is not in the list', () => {
		expect(testMatchCodeList(['hello', 'world'], 'goodbye')).false;
		expect(testMatchCodeList([123, 456, 789, 1011], -123)).false;
	});
	it('Tests true when an array has at least one item form the code list', () => {
		expect(testMatchCodeList(['hello', 'world'], ['hello', 'everyone'])).true;
		expect(testMatchCodeList(['hello', 'world'], ['hello', 'world'])).true;
		expect(testMatchCodeList([123, 456, 789, 1011], [1, 12, 123])).true;
	});
	it('Tests false when an array has no items form the code list', () => {
		expect(testMatchCodeList(['hello', 'world'], ['good', 'bye'])).false;
		expect(testMatchCodeList([123, 456, 789, 1011], [-1, -12, -123])).false;
	});
});

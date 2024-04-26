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

import { DictionaryMeta } from '../../src';

describe('Meta', () => {
	it('Can accept non-nested values', () => {
		const meta = { a: 'string', b: 123, c: true };
		expect(DictionaryMeta.safeParse(meta).success).true;
	});
	it('Can accept nested values', () => {
		const singleNested = { a: 'string', b: 123, c: true, nested: { d: 'asdf' } };
		const doubleNested = { a: 'string', b: 123, c: true, nested: { d: 'asdf', nested2: { e: 'asdf' } } };
		expect(DictionaryMeta.safeParse(singleNested).success).true;
		expect(DictionaryMeta.safeParse(doubleNested).success).true;
	});
	it('Can accept arrays of strings', () => {
		const meta = { a: 'string', b: 123, c: true, array: ['asdf', 'qwerty'] };
		expect(DictionaryMeta.safeParse(meta).success).true;
	});
	it('Can accept arrays of numbers', () => {
		const meta = { a: 'string', b: 123, c: true, array: [123, 456, 789] };
		expect(DictionaryMeta.safeParse(meta).success).true;
	});
	it('Cannot accept arrays of booleans', () => {
		// This constraint feels a bit arbitrary but I can't imagine a clear use case for this.
		// Could be changed with discussion
		const meta = { a: 'string', b: 123, c: true, array: [true, false, true, false] };
		expect(DictionaryMeta.safeParse(meta).success).false;
	});
	it('Cannot accept arrays of mixed types', () => {
		const meta = { a: 'string', b: 123, c: true, array: ['asdf', 123] };
		expect(DictionaryMeta.safeParse(meta).success).false;
	});
});

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
import { Integer, NameString } from '../../src';

describe('Common Dictionary Types', () => {
	describe('NameString', () => {
		it("Can't be empty string", () => {
			expect(NameString.safeParse('').success).false;
		});
		it('Can be string', () => {
			expect(NameString.safeParse('any').success).true;
			expect(NameString.safeParse('123').success).true;
			expect(NameString.safeParse('_').success).true;
			// NOTE: if we want to limit the property names we should explicitly declare those reules, right now all characters are valid and the strings dont have to start with a letter
		});
		it("Can't contain a `.`", () => {
			expect(NameString.safeParse('asdf.asdf').success).false;
			expect(NameString.safeParse('.').success).false;
			expect(NameString.safeParse('.asdf').success).false;
			expect(NameString.safeParse('adsf.').success).false;
			expect(NameString.safeParse('\\.').success).false;
		});
	});

	describe('Integer', () => {
		it("Can't be float", () => {
			expect(Integer.safeParse(1.3).success).false;
			expect(Integer.safeParse(2.0000001).success).false;
			// Note: float precision issues, if the float resolves to a whole number the value will be accepted.
		});
		it("Can't be string, boolean, object, array", () => {
			expect(Integer.safeParse('1').success).false;
			expect(Integer.safeParse(true).success).false;
			expect(Integer.safeParse([1]).success).false;
			expect(Integer.safeParse({}).success).false;
			expect(Integer.safeParse({ thing: 1 }).success).false;
		});
		it('Can be integer', () => {
			expect(Integer.safeParse(1).success).true;
			expect(Integer.safeParse(0).success).true;
			expect(Integer.safeParse(-1).success).true;
			expect(Integer.safeParse(1123).success).true;
		});
	});
});

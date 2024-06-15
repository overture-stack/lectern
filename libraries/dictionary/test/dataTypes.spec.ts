/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
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
import { REGEXP_BOOLEAN_VALUE } from '../src';

describe('Data Types', () => {
	describe('Boolean RegExp', () => {
		it('Matches case insensitive values of `true` and `false`', () => {
			expect('true'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
			expect('True'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
			expect('TRUE'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
			expect('false'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
			expect('False'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
			expect('FALSE'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
		});
		it('Matches strings with leading and trailing whitespace', () => {
			// leading spaces
			expect('   true'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;

			// trailing tab
			expect('True	'.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;

			// trailing new line
			expect(
				'TRUE\
			'.match(REGEXP_BOOLEAN_VALUE),
			).to.not.be.null;

			// leading and trailing spaces
			expect('   false   '.match(REGEXP_BOOLEAN_VALUE)).to.not.be.null;
		});
		it('Rejects empty strings', () => {
			expect(''.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
		});
		it('Rejects typos and invalid values', () => {
			expect('ttrue'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('Truee'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('asdf'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('tr ue'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('true true'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('true|false'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('true,true'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
			expect('text with true in the middle'.match(REGEXP_BOOLEAN_VALUE)).to.be.null;
		});
	});
});

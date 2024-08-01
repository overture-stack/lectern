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
import { resolveFieldRestrictions } from '../../src/validateField/resolveFieldRestrictions';
import { fieldStringManyRestrictions } from '../fixtures/fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldStringNoRestriction } from '../fixtures/fields/noRestrictions/fieldStringNoRestriction';
import { fieldStringArrayMultipleRegex } from '../fixtures/fields/multipleRestrictions/fieldStringArrayMultipleRegex';

describe('Field - resolveFieldRestrictions', () => {
	it('Returns empty array when there are no restrictions', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringNoRestriction);
		expect(restrictions.length).equal(0);
	});
	it('Returns array with rules matching restrictions in a single restrictions object', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringManyRestrictions);
		expect(restrictions.length).equal(3);
		const regexRestriction = restrictions.find((restriction) => restriction.type === 'regex');
		expect(regexRestriction).not.undefined;
		const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
		expect(requiredRestriction).not.undefined;
		const codeListRestriction = restrictions.find((restriction) => restriction.type === 'codeList');
		expect(codeListRestriction).not.undefined;
	});
	it('Returns array with rules from all objects in restrictions array', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringArrayMultipleRegex);
		expect(restrictions.length).equal(2);
		expect(restrictions.every((restriction) => restriction.type === 'regex')).true;
	});
});

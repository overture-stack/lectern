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

import type { RestrictionRange } from '@overture-stack/lectern-dictionary';
import { isWithinRange } from '../../src/utils/isWithinRange';
import { expect } from 'chai';

describe('Utils - rangeTest', () => {
	describe('Min only', () => {
		it('Returns true when value greater than min', () => {
			const range: RestrictionRange = { min: 0 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns false when value lesser than min', () => {
			const range: RestrictionRange = { min: 0 };
			const result = isWithinRange(range, -10);
			expect(result).to.be.false;
		});
		it('Returns true when value equals min', () => {
			const min = 0;
			const range: RestrictionRange = { min };
			const result = isWithinRange(range, min);
			expect(result).to.be.true;
		});
	});
	describe('Max only', () => {
		it('Returns true when value lesser than max', () => {
			const range: RestrictionRange = { max: 100 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns false when value greater than max', () => {
			const range: RestrictionRange = { max: 100 };
			const result = isWithinRange(range, 110);
			expect(result).to.be.false;
		});
		it('Returns true when value equals max', () => {
			const max = 100;
			const range: RestrictionRange = { max };
			const result = isWithinRange(range, max);
			expect(result).to.be.true;
		});
	});
	describe('Exclusive max', () => {
		it('Returns true when value lesser than exclusiveMax', () => {
			const range: RestrictionRange = { exclusiveMax: 100 };
			const result = isWithinRange(range, 10);
			expect(result).to.be.true;
		});
		it('Returns false when value greater than exclusiveMax', () => {
			const range: RestrictionRange = { exclusiveMax: 100 };
			const result = isWithinRange(range, 110);
			expect(result).to.be.false;
		});
		it('Returns false when value equals exclusiveMax', () => {
			const exclusiveMax = 100;
			const range: RestrictionRange = { exclusiveMax };
			const result = isWithinRange(range, exclusiveMax);
			expect(result).to.be.false;
		});
	});
	describe('Exclusive min', () => {
		it('Returns true when value greater than exclusiveMin', () => {
			const range: RestrictionRange = { exclusiveMin: 10 };
			const result = isWithinRange(range, 20);
			expect(result).to.be.true;
		});
		it('Returns false when value lesser than exclusiveMin', () => {
			const range: RestrictionRange = { exclusiveMin: 10 };
			const result = isWithinRange(range, 0);
			expect(result).to.be.false;
		});
		it('Returns false when value equals exclusiveMin', () => {
			const exclusiveMin = 100;
			const range: RestrictionRange = { exclusiveMin };
			const result = isWithinRange(range, exclusiveMin);
			expect(result).to.be.false;
		});
	});
	it('Returns true when value is within range', () => {
		expect(isWithinRange({ min: 0, max: 10 }, 5)).to.be.true;
		expect(isWithinRange({ min: 0, max: 10 }, 0)).to.be.true;
		expect(isWithinRange({ min: 0, max: 10 }, 10)).to.be.true;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 5)).to.be.true;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 0)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, max: 10 }, 5)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, max: 10 }, 10)).to.be.true;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 5)).to.be.true;
	});
	it('Returns false when value is outside range', () => {
		expect(isWithinRange({ min: 0, max: 10 }, -5)).to.be.false;
		expect(isWithinRange({ min: 0, max: 10 }, 15)).to.be.false;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, -1)).to.be.false;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 11)).to.be.false;
		expect(isWithinRange({ min: 0, exclusiveMax: 10 }, 10)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, -1)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 11)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, max: 10 }, 0)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 0)).to.be.false;
		expect(isWithinRange({ exclusiveMin: 0, exclusiveMax: 10 }, 10)).to.be.false;
	});
});

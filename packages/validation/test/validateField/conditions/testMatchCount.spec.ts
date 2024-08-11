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
import { testMatchCount } from '../../../src/validateField/conditions';

describe('ConditionalRestriction - testMatchCount', () => {
	describe('Exact value rule', () => {
		it('Tests true when the value is the specified length', () => {
			expect(testMatchCount(3, [1, 2, 3])).true;
			expect(testMatchCount(1, ['test'])).true;
			expect(testMatchCount(0, [])).true;
		});
		it('Tests false when the value is not the specified length', () => {
			expect(testMatchCount(4, [1, 2, 3])).false;
			expect(testMatchCount(2, [1, 2, 3])).false;
			expect(testMatchCount(2, ['test'])).false;
			expect(testMatchCount(0, ['test'])).false;
		});
		it('Tests false for non array values', () => {
			expect(testMatchCount(4, 'test')).false;
			expect(testMatchCount(0, 'test')).false;
			expect(testMatchCount(0, '')).false;
			expect(testMatchCount(0, undefined)).false;
			expect(testMatchCount(0, 0)).false;
			expect(testMatchCount(1, 1)).false;
		});
	});
	describe('Range rule', () => {
		it('Tests true when the value has a length within the range', () => {
			expect(testMatchCount({ min: 2, max: 5 }, [1, 2, 3])).true;
			expect(testMatchCount({ min: 1 }, [1])).true;
			expect(testMatchCount({ exclusiveMax: 10 }, [1, 2, 3, 4, 5, 6, 7, 8, 9])).true;
		});
		it('Tests false when the value has a length outside the range', () => {
			expect(testMatchCount({ min: 4, max: 5 }, [1, 2, 3])).false;
			expect(testMatchCount({ exclusiveMax: 9 }, [1, 2, 3, 4, 5, 6, 7, 8, 9])).false;
			expect(testMatchCount({ exclusiveMin: 1 }, [1])).false;
		});
		it('Tests false for non array values', () => {
			expect(testMatchCount({ min: 1 }, 'test')).false;
			expect(testMatchCount({ min: 1 }, 'test')).false;
			expect(testMatchCount({ min: 1 }, '')).false;
			expect(testMatchCount({ min: 1 }, undefined)).false;
			expect(testMatchCount({ min: 1 }, 0)).false;
			expect(testMatchCount({ min: 1 }, 1)).false;
		});
	});
});

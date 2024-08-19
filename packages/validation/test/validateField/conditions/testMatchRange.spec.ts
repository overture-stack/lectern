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
import { testMatchRange } from '../../../src/validateField/conditions';

describe('ConditionalRestriction - testMatchRange', () => {
	it('Tests true for number values within range', () => {
		expect(testMatchRange({ min: 0, max: 10 }, 5)).true;
		expect(testMatchRange({ min: 1000, max: 2000 }, 1005)).true;
		expect(testMatchRange({ exclusiveMin: 0 }, 1)).true;
		expect(testMatchRange({ exclusiveMax: 0 }, -1)).true;
	});
	it('Tests false for number values outside of range', () => {
		expect(testMatchRange({ min: 0, max: 10 }, 15)).false;
		expect(testMatchRange({ min: 1000, max: 2000 }, 2005)).false;
		expect(testMatchRange({ exclusiveMin: 0 }, 0)).false;
		expect(testMatchRange({ exclusiveMax: 0 }, 0)).false;
	});
	it('Tests false for non-number primitive values', () => {
		expect(testMatchRange({ min: 0, max: 10 }, 'hello')).false;
		expect(testMatchRange({ min: 0, max: 10 }, '5')).false;
		expect(testMatchRange({ min: 0, max: 10 }, true)).false;
		expect(testMatchRange({ min: 0, max: 10 }, false)).false;
		expect(testMatchRange({ min: 0, max: 10 }, undefined)).false;
	});
	it('Tests true for array with at least one number value within range', () => {
		expect(testMatchRange({ min: 0, max: 10 }, [5])).true;
		expect(testMatchRange({ min: 0, max: 10 }, [5, 6, 7, 8, 9])).true;
		expect(testMatchRange({ min: 0, max: 10 }, [5, 15, 25, 35])).true;
	});
	it('Tests false for array with no value within range', () => {
		expect(testMatchRange({ min: 0, max: 10 }, [])).false;
		expect(testMatchRange({ min: 0, max: 10 }, [15, 25, 35])).false;
		expect(testMatchRange({ min: 0, max: 10 }, ['5', 'hello'])).false;
	});
});

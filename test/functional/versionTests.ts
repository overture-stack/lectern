/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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
import { isValidVersion, incrementMinor, incrementMajor, isGreater } from '../../src/utils/version';

describe('Verifying version strings', () => {
	it('Should verify a proper version string of form X.Y', () => {
		expect(isValidVersion('1.0')).to.equal(true);
	});

	it('Should verify with leading zero', () => {
		expect(isValidVersion('0.55')).to.equal(true);
	});

	it('Should reject an empty string', () => {
		expect(isValidVersion('')).to.equal(false);
	});

	it('Should reject version with less than two parts', () => {
		expect(isValidVersion('34534523')).to.equal(false);
	});

	it('Should reject version with more than two parts', () => {
		expect(isValidVersion('1.2.3')).to.equal(false);
	});
});

describe('Incrementing version strings', () => {
	it('Should increment minor version', () => {
		expect(incrementMinor('1.0')).to.equal('1.1');
	});

	it('Should increment minor version with increase in digits', () => {
		expect(incrementMinor('1.9')).to.equal('1.10');
	});

	it('Should increment major version', () => {
		expect(incrementMajor('1.9')).to.equal('2.0');
	});

	it('Should increment major version with increase in digits', () => {
		expect(incrementMajor('9.9')).to.equal('10.0');
	});
});

describe('Comparing version strings', () => {
	it('Expect 1.0 to be greater than 0.11', () => {
		expect(isGreater('1.0', '0.1')).to.be.true;
	});

	it('Expect 19.0 to be greater than 2.5', () => {
		expect(isGreater('19.0', '2.5')).to.be.true;
	});

	it('Expect 1.0 to be less than 1.01', () => {
		expect(isGreater('1.0', '1.01')).to.be.false;
	});

	it('Expect 1.0 to not be greater than 1.0', () => {
		expect(isGreater('1.0', '1.0')).to.be.false;
	});
});

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
import { convertRecordValues } from '../../src';
import { schemaAllDataTypes } from '../fixtures/schema/schemaAllDataTypes';
import assert from 'assert';

describe('Convert Values - convertRecordValues', () => {
	it('Successfully converts all fields in record', () => {
		const record = {
			'any-string': 'hello world',
			'any-number': '12.34',
			'any-integer': '7890',
			'any-boolean': 'true',
		};
		const result = convertRecordValues(record, schemaAllDataTypes);
		expect(result.success).true;
		assert(result.success === true);
		expect(result.data.record).deep.equal({
			'any-string': 'hello world',
			'any-number': 12.34,
			'any-integer': 7890,
			'any-boolean': true,
		});
	});
	it('Failed conversion reports an error for each invalid field', () => {
		const record = {
			'any-string': 'hello world',
			'any-number': 'NaN',
			'any-integer': '12.34',
			'any-boolean': 'not a boolean',
		};
		const result = convertRecordValues(record, schemaAllDataTypes);
		expect(result.success).false;
		assert(result.success === false);
		expect(result.data.errors.length).equal(3);
		expect(result.data.record).deep.equal({
			'any-string': 'hello world',
			'any-number': 'NaN',
			'any-integer': '12.34',
			'any-boolean': 'not a boolean',
		});

		const anyNumberError = result.data.errors.find((error) => error.fieldName === 'any-number');
		expect(anyNumberError).not.undefined;
		assert(anyNumberError !== undefined);
		expect(anyNumberError.value).equal('NaN');

		const anyIntegerError = result.data.errors.find((error) => error.fieldName === 'any-integer');
		expect(anyIntegerError).not.undefined;
		assert(anyIntegerError !== undefined);
		expect(anyIntegerError.value).equal('12.34');

		const anyBooleanError = result.data.errors.find((error) => error.fieldName === 'any-boolean');
		expect(anyBooleanError).not.undefined;
	});
	it('Failed conversion result contains record with valid fields converted', () => {
		const record = {
			'any-string': 'hello world',
			'any-number': '12.34',
			'any-integer': '12.34',
			'any-boolean': 'true',
		};
		const result = convertRecordValues(record, schemaAllDataTypes);
		expect(result.success).false;
		assert(result.success === false);
		expect(result.data.record).deep.equal({
			'any-string': 'hello world',
			'any-number': 12.34, // number is converted
			'any-integer': '12.34', // integer is invalid, not converted
			'any-boolean': true, // boolean is converted
		});
	});
	it('Failed conversion result when record contains unrecognized fields', () => {
		const record = {
			'unrecognized-field': 'true',
		};
		const result = convertRecordValues(record, schemaAllDataTypes);
		expect(result.success).false;
		assert(result.success === false);
		expect(result.data.record).deep.equal({
			'unrecognized-field': 'true',
		});
		expect(result.data.errors).length(1);
		const unrecognizedFieldError = result.data.errors[0];
		expect(unrecognizedFieldError).exist;
		assert(unrecognizedFieldError !== undefined);
		expect(unrecognizedFieldError.reason).equal('UNRECOGNIZED_FIELD');
		expect(unrecognizedFieldError.fieldName).equal('unrecognized-field');
		expect(unrecognizedFieldError.value).equal('true');
	});
});

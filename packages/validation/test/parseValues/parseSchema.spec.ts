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
import { parseSchemaValues } from '../../src';
import { schemaAllDataTypes } from '../fixtures/schema/schemaAllDataTypes';
import assert from 'assert';

describe('Parse Values - parseSchemaValues', () => {
	it('Successfully parses all records in schema dataset', () => {
		const records = [
			{
				'any-string': 'hello world 1',
				'any-number': '12.34',
				'any-integer': '1234321',
				'any-boolean': 'true',
			},
			{
				'any-string': 'hello world 2',
				'any-number': '23.45',
				'any-integer': '2345432',
				'any-boolean': 'TRUE',
			},
			{
				'any-string': 'hello world 3',
				'any-number': '34.56',
				'any-integer': '3456543',
				'any-boolean': 'False',
			},
		];
		const result = parseSchemaValues(records, schemaAllDataTypes);
		expect(result.success).true;
		assert(result.success === true);
		expect(result.data.records[0]).deep.equal({
			'any-string': 'hello world 1',
			'any-number': 12.34,
			'any-integer': 1234321,
			'any-boolean': true,
		});
		expect(result.data.records[1]).deep.equal({
			'any-string': 'hello world 2',
			'any-number': 23.45,
			'any-integer': 2345432,
			'any-boolean': true,
		});
		expect(result.data.records[2]).deep.equal({
			'any-string': 'hello world 3',
			'any-number': 34.56,
			'any-integer': 3456543,
			'any-boolean': false,
		});
	});
	it('Failed conversion reports errors from each record that failed', () => {
		const records = [
			{
				'any-string': 'valid record',
				'any-number': '12.34',
				'any-integer': '1234321',
				'any-boolean': 'true',
			},
			{
				'any-string': 'invalid 1',
				'any-number': 'not a number',
				'any-integer': '1234321',
				'any-boolean': 'true',
			},
			{
				'any-string': 'invalid 2',
				'any-number': '23.45',
				'any-integer': 'not an integer',
				'any-boolean': 'TRUE',
			},
			{
				'any-string': 'invalid 3',
				'any-number': '34.56',
				'any-integer': '3456543',
				'any-boolean': 'not a boolean',
			},
		];
		const result = parseSchemaValues(records, schemaAllDataTypes);
		expect(result.success).false;
		assert(result.success === false);
		expect(result.data.errors.length).equal(3);

		const firstError = result.data.errors.find((error) => error.recordIndex === 1);
		expect(firstError).not.undefined;
		assert(firstError !== undefined);
		expect(firstError.recordErrors.length).equal(1);
		expect(firstError.recordErrors[0]?.fieldName).equal('any-number');

		const secondError = result.data.errors.find((error) => error.recordIndex === 2);
		expect(secondError).not.undefined;
		assert(secondError !== undefined);
		expect(secondError.recordErrors.length).equal(1);
		expect(secondError.recordErrors[0]?.fieldName).equal('any-integer');

		const thirdError = result.data.errors.find((error) => error.recordIndex === 3);
		expect(thirdError).not.undefined;
		assert(thirdError !== undefined);
		expect(thirdError.recordErrors.length).equal(1);
		expect(thirdError.recordErrors[0]?.fieldName).equal('any-boolean');
	});
});

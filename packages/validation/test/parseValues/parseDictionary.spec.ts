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
import assert from 'node:assert';
import { parseDictionaryValues } from '../../src';
import { dictionaryFourSchemas } from '../fixtures/dictionaries/dictionaryFourSchemas';

describe('Parse Values - parseDictionaryValues', () => {
	it('Successfully parses all records for all schemas in the dictionary dataset', () => {
		const singleStringRecords = [{ 'any-string': 'whatever' }];
		const allDataTypeRecords = [
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
		const allDataRequiredRecords = [
			{
				'string-required': 'super important string',
				'number-required': '1000000000',
				'integer-required': '0',
				'boolean-required': 'false',
			},
		];
		const uniqueKeyRecords = [
			{
				'any-string': 'could be anything',
				'any-number': '1',
				'any-integer': '-1',
				'any-boolean': 'false',
			},
			{
				'any-string': 'could be this',
				'any-number': '2.2',
				'any-integer': '-2',
				'any-boolean': 'true',
			},
		];

		const dataset = {
			'single-string': singleStringRecords,
			'all-data-types': allDataTypeRecords,
			'all-data-types-required': allDataRequiredRecords,
			'unique-key': uniqueKeyRecords,
		};
		const result = parseDictionaryValues(dataset, dictionaryFourSchemas);
		expect(result.success).true;
		assert(result.success === true);
	});
	it('Reports unrecognized schema error', () => {
		const unknownSchemaRecords = [{ 'any-field': 'whatever' }];

		const dataset = {
			'unknown-schema': unknownSchemaRecords,
		};
		const result = parseDictionaryValues(dataset, dictionaryFourSchemas);
		expect(result.success).false;
		assert(result.success === false);

		// Get the
		const parseConversionResult = result.data['unknown-schema'];
		expect(parseConversionResult?.success).false;
		assert(parseConversionResult?.success === false);

		expect(parseConversionResult.data.reason).equal('UNRECOGNIZED_SCHEMA');
	});
	it('Returns invalid when there is a mix of correct and incorrect schemas', () => {
		const singleStringRecords = [{ 'any-string': 'whatever' }]; // valid
		const allDataRequiredRecords = [
			{
				'string-required': 'super important string',
				'number-required': '1000000000',
				'integer-required': '0.123', // needs to be an integer
				'boolean-required': 'false',
			},
		];
		const unrecognizedSchemaRecords = [{ 'any-field': 'whatever' }];

		const dataset = {
			'single-string': singleStringRecords,
			'all-data-types-required': allDataRequiredRecords,
			'unknown-schema': unrecognizedSchemaRecords,
		};
		const result = parseDictionaryValues(dataset, dictionaryFourSchemas);
		expect(result.success).false;
		assert(result.success === false);

		const singleStringResult = result.data['single-string'];
		expect(singleStringResult?.success).true;

		const allFieldsResult = result.data['all-data-types-required'];
		expect(allFieldsResult?.success).false;
		assert(allFieldsResult?.success === false);
		expect(allFieldsResult.data.reason).equal('INVALID_RECORDS');

		const unrecognizedResult = result.data['unknown-schema'];
		expect(unrecognizedResult?.success).false;
		assert(unrecognizedResult?.success === false);
		expect(unrecognizedResult.data.reason).equal('UNRECOGNIZED_SCHEMA');
	});
});

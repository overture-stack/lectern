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
import { validateRecord } from '../../src';
import { schemaSingleString } from '../fixtures/schema/schemaSingleString';

import { schemaAllDataTypesRequired } from '../fixtures/schema/schemaAllDataTypesRequired';
import { schemaSingleStringRequired } from '../fixtures/schema/schemaSingleStringRequired';
import { schemaAllDataTypesMixedRestrictions } from '../fixtures/schema/schemaAllDataMixedRestrictions';
import { fieldStringManyRestrictions } from '../fixtures/fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldNumberArrayCodeList } from '../fixtures/fields/simpleRestrictions/number/fieldNumberArrayCodeList';
import { fieldIntegerRequired } from '../fixtures/fields/simpleRestrictions/integer/fieldIntegerRequired';

describe('Record - validateRecord', () => {
	it('Valid with single field with valid value, no restrictions', () => {
		expect(validateRecord({ [schemaSingleString.fields[0].name]: 'test value' }, schemaSingleString).valid).true;
	});
	it('Valid with all fields with valid values, many restrictions', () => {
		const result = validateRecord(
			{
				'complicated-multi-restriction-rules': '2001-01-01',
				'number-code-list': [1.61803, 2.41421],
				'integer-required': 123,
				'any-boolean': false,
			},
			schemaAllDataTypesMixedRestrictions,
		);
		expect(result.valid).true;
	});
	it('Valid when missing optional fields', () => {
		expect(validateRecord({}, schemaSingleString).valid).true;
	});
	describe('Unrecognized Fields', () => {
		it('Invalid when given record with unrecognized field', () => {
			const unknownFieldName = 'unknown-field-name';
			const unknownFieldValue = 123;
			const result = validateRecord({ [unknownFieldName]: unknownFieldValue }, schemaSingleString);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length).equal(1);
			expect(result.info[0]?.reason).equal('UNRECOGNIZED_FIELD');
			expect(result.info[0]?.fieldName).equal(unknownFieldName);
			expect(result.info[0]?.value).equal(unknownFieldValue);
		});
		it('Invalid with multiple unrecognized fields, reports each error', () => {
			const unknownFieldNameA = 'unknown-field-name-a';
			const unknownFieldValueA = 123;
			const unknownFieldNameB = 'unknown-field-name-b';
			const unknownFieldValueB = 'abcdefg';
			const record = { [unknownFieldNameA]: unknownFieldValueA, [unknownFieldNameB]: unknownFieldValueB };
			const result = validateRecord(record, schemaSingleString);

			expect(result.valid).false;
			assert(result.valid === false);

			// Confirmed result is invalid, make sure we have multiple unrecognized field errors with the correct info
			expect(result.info.length).equal(2);
			const fieldErrorA = result.info.find((error) => error.fieldName === unknownFieldNameA);
			expect(fieldErrorA).not.undefined;
			assert(fieldErrorA !== undefined);
			expect(fieldErrorA.reason).equal('UNRECOGNIZED_FIELD');
			expect(fieldErrorA.value).equal(record[unknownFieldNameA]);

			const fieldErrorB = result.info.find((error) => error.fieldName === unknownFieldNameB);
			expect(fieldErrorB).not.undefined;
			assert(fieldErrorB !== undefined);
			expect(fieldErrorB.reason).equal('UNRECOGNIZED_FIELD');
			expect(fieldErrorB.value).equal(record[unknownFieldNameB]);
		});
	});

	describe('Field Restriction Errors', () => {
		it('Invalid when missing required field', () => {
			const result = validateRecord({}, schemaSingleStringRequired);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length).equal(1);
			expect(result.info[0]?.reason).equal('INVALID_BY_RESTRICTION');
			expect(result.info[0]?.fieldName).equal('string-required');
			expect(result.info[0]?.value).equal(undefined);
		});

		it('Invalid with multiple missing required fields, reports each error', () => {
			const result = validateRecord({}, schemaAllDataTypesRequired);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length).equal(4);

			const fieldError0 = result.info.find((error) => error.fieldName === schemaAllDataTypesRequired.fields[0].name);
			const fieldError1 = result.info.find((error) => error.fieldName === schemaAllDataTypesRequired.fields[1].name);
			const fieldError2 = result.info.find((error) => error.fieldName === schemaAllDataTypesRequired.fields[2].name);
			const fieldError3 = result.info.find((error) => error.fieldName === schemaAllDataTypesRequired.fields[3].name);
			expect(fieldError0).not.undefined;
			expect(fieldError1).not.undefined;
			expect(fieldError2).not.undefined;
			expect(fieldError3).not.undefined;
			assert(
				fieldError0 !== undefined &&
					fieldError1 !== undefined &&
					fieldError2 !== undefined &&
					fieldError3 !== undefined,
			);

			expect(fieldError0.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldError0.value).equal(undefined);
			expect(fieldError1.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldError1.value).equal(undefined);
			expect(fieldError2.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldError2.value).equal(undefined);
			expect(fieldError3.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldError3.value).equal(undefined);

			// each of these errors will have fieldValidationErrors inside them which are validated in validateField.spec.ts
		});

		it('Invalid with multiple failed restrictions', () => {
			const result = validateRecord(
				{
					'complicated-multi-restriction-rules': 'this value is wrong', // triggers both regex and codeList error
					'number-code-list': [1.61803, 2.41421, 0], // 0 is codeList error in position 2 of invalidItems
					// missing 'integer-required' and 'any-boolean' fields. ''integer-required' should add an INVALID_FIELD_VALUE error
				},
				schemaAllDataTypesMixedRestrictions,
			);
			console.log(JSON.stringify(result, null, 2));
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length).equal(3);

			const fieldErrorStringMany = result.info.find((error) => error.fieldName === fieldStringManyRestrictions.name);
			expect(fieldErrorStringMany).not.undefined;
			const fieldErrorNumberCodeList = result.info.find((error) => error.fieldName === fieldNumberArrayCodeList.name);
			expect(fieldErrorNumberCodeList).not.undefined;
			const fieldErrorIntegerRequired = result.info.find((error) => error.fieldName === fieldIntegerRequired.name);
			expect(fieldErrorIntegerRequired).not.undefined;
			assert(
				fieldErrorStringMany !== undefined &&
					fieldErrorNumberCodeList !== undefined &&
					fieldErrorIntegerRequired !== undefined,
			);

			expect(fieldErrorStringMany.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldErrorStringMany.value).equal('this value is wrong');
			expect(fieldErrorNumberCodeList.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldErrorNumberCodeList.value).deep.equal([1.61803, 2.41421, 0]);
			expect(fieldErrorIntegerRequired.reason).equal('INVALID_BY_RESTRICTION');
			expect(fieldErrorIntegerRequired.value).equal(undefined);
		});
	});
	describe('Mixed Errors', () => {
		it('Invalid with mix of unrecognized field and failed restrictions', () => {
			const result = validateRecord(
				{
					'complicated-multi-restriction-rules': '2001-01-01', // correct
					'number-code-list': 'should be a number', // wrong type, should add a INVALID_FIELD_VALUE error
					'integer-required': 1,
					// missing 'any-boolean' field, this is optional so no problem.
					'unknown-field': 123, // unknown field this, should add a UNRECOGNIZED_FIELD error
				},
				schemaAllDataTypesMixedRestrictions,
			);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length).equal(2);

			const fieldValueError = result.info.find((error) => error.fieldName === 'number-code-list');
			const unknownFieldError = result.info.find((error) => error.fieldName === 'unknown-field');
			expect(fieldValueError).not.undefined;
			expect(unknownFieldError).not.undefined;
			assert(fieldValueError !== undefined && unknownFieldError !== undefined);

			expect(fieldValueError.reason).equal('INVALID_VALUE_TYPE');
			expect(fieldValueError.value).equal('should be a number');

			expect(unknownFieldError.reason).equal('UNRECOGNIZED_FIELD');
			expect(unknownFieldError.value).equal(123);
		});
	});
});

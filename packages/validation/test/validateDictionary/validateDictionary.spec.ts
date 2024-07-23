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
import { validateDictionary, type DictionaryValidationErrorInvalidRecords } from '../../src/validateDictionary';
import { dictionarySingleSchemaNoRestrictions } from '../fixtures/dictionaries/dictionarySingleSchemaNoRestrictions';
import assert from 'node:assert';
import { dictionarySingleSchemaRequiredRestrictions } from '../fixtures/dictionaries/dictionarySingleSchemaRequiredRestrictions';
import { dictionarySingleSchemaUniqueKeyRestriction } from '../fixtures/dictionaries/dictionarySingleSchemaUniqueKeyRestriction';
import { dictionaryMultipleSchemasNoRestrictions } from '../fixtures/dictionaries/dictionaryMultipleSchemasNoRestrictions';
import { dictionaryForeignKeySimple } from '../fixtures/dictionaries/foreignKey/dictionaryForeignKeySimple';
import { dictionaryForeignKeyMultiple } from '../fixtures/dictionaries/foreignKey/dictionaryForeignKeyMultiple';

describe('Dictionary - validateDictionary', () => {
	describe('Single Schema', () => {
		it('Valid with no restrictions and empty data set', () => {
			const dataSet = {};
			const result = validateDictionary(dataSet, dictionarySingleSchemaNoRestrictions);
			expect(result.valid).true;
		});
		it('Valid with correct data set, no restrictions', () => {
			const dataSet = {
				'single-string': [{ 'any-string': '1234' }, {}, { 'any-string': 'some string' }],
			};
			const result = validateDictionary(dataSet, dictionarySingleSchemaNoRestrictions);
			expect(result.valid).true;
		});
		it('Valid with correct data set, with restrictions', () => {
			const schemaName = dictionarySingleSchemaRequiredRestrictions.schemas[0].name;
			const stringField = dictionarySingleSchemaRequiredRestrictions.schemas[0].fields[0].name;
			const numberField = dictionarySingleSchemaRequiredRestrictions.schemas[0].fields[1].name;
			const integerField = dictionarySingleSchemaRequiredRestrictions.schemas[0].fields[2].name;
			const booleanField = dictionarySingleSchemaRequiredRestrictions.schemas[0].fields[3].name;
			const dataSet = {
				[schemaName]: [
					{ [stringField]: 'a random string', [numberField]: 98.76, [integerField]: 543, [booleanField]: false },
					{ [stringField]: 'another random string', [numberField]: 87.65, [integerField]: 432, [booleanField]: true },
				],
			};
			const result = validateDictionary(dataSet, dictionarySingleSchemaRequiredRestrictions);
			expect(result.valid).true;
		});
		it('Invalid with recognized schema names', () => {
			const wrongSchemaName = 'wrong-schema-name';
			const dataSet = {
				[wrongSchemaName]: [],
			};
			const result = validateDictionary(dataSet, dictionarySingleSchemaNoRestrictions);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'Only one schema found invalid.').equal(1);
			expect(result.details[0]?.reason).equal('UNRECOGNIZED_SCHEMA');
			expect(result.details[0]?.schemaName, 'Correctly names the unrecognized schema.').equal(wrongSchemaName);
		});
		it('Invalid with correct data type rules', () => {
			const schemaName = dictionarySingleSchemaNoRestrictions.schemas[0].name;
			const fieldName = dictionarySingleSchemaNoRestrictions.schemas[0].fields[0].name;
			const dataSet = {
				[schemaName]: [{ [fieldName]: 1234 }], // value must be string, not number
			};
			const result = validateDictionary(dataSet, dictionarySingleSchemaNoRestrictions);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'Only one schema found invalid.').equal(1);
			expect(result.details[0]?.schemaName, 'Correctly names schema with error.').equal(schemaName);
			expect(result.details[0]?.reason).equal('INVALID_RECORDS');
			expect((result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords[0]?.recordIndex).equal(0);
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords[0]?.recordErrors.length,
				'Only one error found for field.',
			).equal(1);
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords[0]?.recordErrors[0]?.reason,
			).equal('INVALID_VALUE_TYPE');
		});
		it('Invalid with schema uniqueKey restriction', () => {
			const schemaName = dictionarySingleSchemaUniqueKeyRestriction.schemas[0].name;
			// records 0 and 2 share the same unique key
			const dataSet = {
				[schemaName]: [
					{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string': 'qwerty', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				],
			};
			const result = validateDictionary(dataSet, dictionarySingleSchemaUniqueKeyRestriction);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'Only one schema found invalid.').equal(1);
			expect(result.details[0]?.schemaName, 'Correctly names schema with error.').equal(schemaName);
			expect(result.details[0]?.reason).equal('INVALID_RECORDS');
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords.length,
				'Correct number of invalid records reported.',
			).equal(2);
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords.some(
					(invalidRecord) => invalidRecord.recordIndex === 0,
				),
				'Record 0 should be reported as invalid',
			).true;
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords.some(
					(invalidRecord) => invalidRecord.recordIndex === 2,
				),
				'Record 2 should be reported as invalid',
			).true;
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords.every(
					(invalidRecord) => invalidRecord.recordErrors.length === 1,
				),
				'Only one error for each invalid record',
			).true;
			expect(
				(result.details[0] as DictionaryValidationErrorInvalidRecords).invalidRecords.every(
					(invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY',
				),
				'Every invalid record is by unique key',
			).true;
		});
	});
	describe('Multiple Schemas, no dictionary restrictions', () => {
		it('Valid for empty data set when no restrictions on all schemas', () => {
			const dataSet = {};
			const result = validateDictionary(dataSet, dictionaryMultipleSchemasNoRestrictions);
			expect(result.valid).true;
		});
		it('Valid for correct data with multiple schemas', () => {
			const dataSet = {
				'single-string': [{ 'any-string': 'hello' }, { 'any-string': 'hello' }, { 'any-string': 'hello' }],
				'all-data-types': [
					{ 'any-string': 'asdf', 'any-number': 12345.6789, 'any-integer': 1234567890, 'any-boolean': false },
					{ 'any-string': 'asdf', 'any-number': 12345.6789, 'any-integer': 1234567890, 'any-boolean': false },
					{ 'any-string': 'asdf', 'any-number': 12345.6789, 'any-integer': 1234567890, 'any-boolean': false },
				],
			};
			const result = validateDictionary(dataSet, dictionaryMultipleSchemasNoRestrictions);
			expect(result.valid).true;
		});
		it('Invalid with invalid fields, lists all errors organized by schema', () => {
			const dataSet = {
				'single-string': [
					{ 'any-string': 123 }, // wrong type
					{ 'unreocgnized-field': 123 },
					{ 'any-string': 'hello', 'extra-unrecognized-field': 123 },
				],
				'all-data-types': [
					{ 'any-string': 123, 'invalid-field-name': 123 }, // invalid type and unrecognized field
					{ 'any-string': 'asdf', 'any-number': 12345.6789, 'any-integer': 1234567890, 'any-boolean': false },
					{ 'any-string': 'asdf', 'any-number': 12345.6789, 'any-integer': 1234567890, 'any-boolean': false },
				],
			};
			const result = validateDictionary(dataSet, dictionaryMultipleSchemasNoRestrictions);
			expect(result.valid).false;
			assert(result.valid === false);
			expect(result.details.length, 'One error for each schema.').equal(2);

			const singleStringSchemaResult = result.details.find((result) => result.schemaName === 'single-string');
			expect(singleStringSchemaResult).not.undefined;
			assert(singleStringSchemaResult !== undefined);
			expect(singleStringSchemaResult.reason).equal('INVALID_RECORDS');
			assert(singleStringSchemaResult.reason === 'INVALID_RECORDS');
			expect(
				singleStringSchemaResult.invalidRecords.length,
				'Should be 3 invalid fields in single-string schema',
			).equal(3);

			const allDataSchemaResult = result.details.find((result) => result.schemaName === 'all-data-types');
			expect(allDataSchemaResult).not.undefined;
			assert(allDataSchemaResult !== undefined);
			expect(allDataSchemaResult.reason).equal('INVALID_RECORDS');
			assert(allDataSchemaResult.reason === 'INVALID_RECORDS');
			expect(allDataSchemaResult.invalidRecords.length, 'Should be 1 invalid record in all-data-types schema').equal(1);
			expect(
				allDataSchemaResult.invalidRecords[0]?.recordErrors.length,
				'Should be 2 invalid fields in the record ',
			).equal(2);
			expect(
				allDataSchemaResult.invalidRecords[0]?.recordErrors.filter(
					(recordError) => recordError.reason === 'UNRECOGNIZED_FIELD',
				).length,
				'Should have 1 unrecognized field error',
			).equal(1);
			expect(
				allDataSchemaResult.invalidRecords[0]?.recordErrors.filter(
					(recordError) => recordError.reason === 'INVALID_VALUE_TYPE',
				).length,
				'Should have 1 invalid value type error',
			).equal(1);
		});
		it('Invalid with unrecognized schema amongst multiple correct schemas', () => {
			const invalidSchemaName = 'invalid-schema';
			const dataSet = {
				'single-string': [],
				'all-data-types': [],
				[invalidSchemaName]: [],
			};
			const result = validateDictionary(dataSet, dictionaryMultipleSchemasNoRestrictions);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details[0]?.reason === 'UNRECOGNIZED_SCHEMA');
			assert(result.details[0] !== undefined && result.details[0].reason === 'UNRECOGNIZED_SCHEMA');
			expect(result.details[0].schemaName).equal(invalidSchemaName);
		});
	});
	describe('Multiple Schemas, foreignKey restrictions', () => {
		it('Valid with correct foreign key values', () => {
			const dataSet = {
				'all-data-types': [
					{ 'any-string': '1234' },
					{},
					{ 'any-string': 'some string' },
					{ 'any-string': 'some string' },
					{ 'any-string': 'another' },
				],
				'string-matching-foreign-string': [
					{ 'string-with-foreign-key': '1234' },
					{ 'string-with-foreign-key': '1234' },
					{ 'string-with-foreign-key': 'some string' },
				],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeySimple);
			expect(result.valid).true;
		});

		it('Invalid when breaking foreign key restriction', () => {
			const dataSet = {
				'all-data-types': [{ 'any-string': '1234' }, { 'any-string': 'some string' }, { 'any-string': 'another' }],
				'string-matching-foreign-string': [{ 'string-with-foreign-key': 'invalid value' }],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeySimple);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length).equal(1);
			expect(result.details[0]?.reason).equal('INVALID_RECORDS');
			assert(result.details[0]?.reason === 'INVALID_RECORDS');
			expect(result.details[0].invalidRecords.length, 'Only 1 invalid record').equal(1);
			expect(result.details[0].invalidRecords[0]?.recordIndex).equal(0);
			expect(result.details[0].invalidRecords[0]?.recordErrors.length, 'Only 1 error on this record').equal(1);
			expect(result.details[0].invalidRecords[0]?.recordErrors[0]?.reason).equal('INVALID_BY_FOREIGNKEY');
			assert(result.details[0].invalidRecords[0]?.recordErrors[0]?.reason === 'INVALID_BY_FOREIGNKEY');
			expect(result.details[0].invalidRecords[0]?.recordErrors[0]?.fieldName).equal('string-with-foreign-key');
			expect(result.details[0].invalidRecords[0]?.recordErrors[0]?.fieldValue).equal('invalid value');
			expect(result.details[0].invalidRecords[0]?.recordErrors[0]?.foreignSchema.schemaName).equal('all-data-types');
			expect(result.details[0].invalidRecords[0]?.recordErrors[0]?.foreignSchema.fieldName).equal('any-string');
		});
		it('Foreign key restriction not applied to undefined values', () => {
			const dataSet = {
				'all-data-types': [{ 'any-string': '1234' }, { 'any-string': 'some string' }, { 'any-string': 'another' }],
				'string-matching-foreign-string': [{ 'string-with-foreign-key': undefined }],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeySimple);
			expect(result.valid).true;
		});
		it('Valid with multiple foreign key restrictions', () => {
			const dataSet = {
				'all-data-types': [
					{ 'any-string': 'asdf', 'any-number': 123.45 },
					{ 'any-number': 111 },
					{ 'any-string': 'qwerty' },
				],
				'single-string': [{ 'any-string': 'asdf' }, { 'any-string': 'lkjh' }, { 'any-string': 'poiuy' }],
				'multiple-foreign-keys': [
					{ 'string-field': 'asdf', 'number-field': 111 },
					{ 'string-field': 'asdf' },
					{ 'number-field': 123.45 },
				],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeyMultiple);
			expect(result.valid).true;
		});
		it('Invalid with multiple foreign key restrictions, all errors listed', () => {
			const dataSet = {
				'all-data-types': [
					{ 'any-string': 'asdf', 'any-number': 123.45 },
					{ 'any-number': 111 },
					{ 'any-string': 'qwerty' },
				],
				'single-string': [{ 'any-string': 'asdf' }, { 'any-string': 'lkjh' }, { 'any-string': 'poiuy' }],
				'multiple-foreign-keys': [
					{ 'string-field': 'asdf', 'number-field': 123.45 },
					{ 'string-field': 'lkjh', 'number-field': 111 },
					{ 'string-field': 'unknown' },
					{ 'number-field': 0 },
				],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeyMultiple);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'One schema with errors').equal(1);
			expect(result.details[0]?.reason).equal('INVALID_RECORDS');
			assert(result.details[0]?.reason === 'INVALID_RECORDS');

			expect(result.details[0].schemaName).equal('multiple-foreign-keys');
			expect(result.details[0].invalidRecords.length, 'Expect 3 records to fail the foreign key restriction').equal(3);

			// Index 0 has no errors
			expect(result.details[0].invalidRecords.find((invalidRecord) => invalidRecord.recordIndex === 0)).undefined;

			const errorIndex1 = result.details[0].invalidRecords.find((invalidRecord) => invalidRecord.recordIndex === 1);
			expect(errorIndex1).not.undefined;
			assert(errorIndex1 !== undefined);
			expect(errorIndex1.recordErrors.length).equal(1);
			expect(errorIndex1.recordErrors[0]?.reason).equal('INVALID_BY_FOREIGNKEY');
			assert(errorIndex1.recordErrors[0]?.reason === 'INVALID_BY_FOREIGNKEY');
			expect(errorIndex1.recordErrors[0].foreignSchema.schemaName).equal('all-data-types');
			expect(errorIndex1.recordErrors[0].foreignSchema.fieldName).equal('any-string');
			expect(errorIndex1.recordErrors[0].fieldName).equal('string-field');
			expect(errorIndex1.recordErrors[0].fieldValue).equal('lkjh');

			const errorIndex2 = result.details[0].invalidRecords.find((invalidRecord) => invalidRecord.recordIndex === 2);
			expect(errorIndex2).not.undefined;
			assert(errorIndex2 !== undefined);
			expect(errorIndex2.recordErrors.length).equal(2);
			expect(errorIndex2.recordErrors[0]?.reason).equal('INVALID_BY_FOREIGNKEY');
			expect(errorIndex2.recordErrors[1]?.reason).equal('INVALID_BY_FOREIGNKEY');
			expect(
				errorIndex2.recordErrors.find(
					(recordError) =>
						recordError.reason === 'INVALID_BY_FOREIGNKEY' && recordError.foreignSchema.schemaName === 'all-data-types',
				),
				'Expect one foreign key error vs all-data-types schema',
			).not.undefined;
			expect(
				errorIndex2.recordErrors.find(
					(recordError) =>
						recordError.reason === 'INVALID_BY_FOREIGNKEY' && recordError.foreignSchema.schemaName === 'single-string',
				),
				'Expect one foreign key error vs single-string schema',
			).not.undefined;

			const errorIndex3 = result.details[0].invalidRecords.find((invalidRecord) => invalidRecord.recordIndex === 3);
			expect(errorIndex3).not.undefined;
			assert(errorIndex3 !== undefined);
			expect(errorIndex3.recordErrors.length).equal(1);
			expect(errorIndex3.recordErrors[0]?.reason).equal('INVALID_BY_FOREIGNKEY');
			assert(errorIndex3.recordErrors[0]?.reason === 'INVALID_BY_FOREIGNKEY');
			expect(errorIndex3.recordErrors[0].foreignSchema.schemaName).equal('all-data-types');
			expect(errorIndex3.recordErrors[0].foreignSchema.fieldName).equal('any-number');
			expect(errorIndex3.recordErrors[0].fieldName).equal('number-field');
			expect(errorIndex3.recordErrors[0].fieldValue).equal(0);
		});
		it('Invalid with mix of foreign key and field validation errors', () => {
			const dataSet = {
				'all-data-types': [{ 'any-string': '1234' }, { 'any-string': 'some string' }, { 'any-string': 'another' }],
				'string-matching-foreign-string': [{ 'string-with-foreign-key': 123 }],
			};
			const result = validateDictionary(dataSet, dictionaryForeignKeySimple);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length).equal(1);
			expect(result.details[0]?.reason).equal('INVALID_RECORDS');
			assert(result.details[0]?.reason === 'INVALID_RECORDS');
			expect(result.details[0].invalidRecords.length, 'Only 1 invalid record').equal(1);
			expect(result.details[0].invalidRecords[0]?.recordIndex).equal(0);
			expect(result.details[0].invalidRecords[0]?.recordErrors.length, 'Expect 2 errors on this record').equal(2);

			const valueTypeError = result.details[0].invalidRecords[0]?.recordErrors.find(
				(recordError) => recordError.reason === 'INVALID_VALUE_TYPE',
			);
			expect(valueTypeError).not.undefined;
			assert(valueTypeError !== undefined);

			const foreignKeyError = result.details[0].invalidRecords[0]?.recordErrors.find(
				(recordError) => recordError.reason === 'INVALID_BY_FOREIGNKEY',
			);
			expect(foreignKeyError).not.undefined;
			assert(foreignKeyError !== undefined);
		});
		// TODO: foreign keys on fields that are arrays need their own rules defined, currently they will not resolve correctly.
	});
});

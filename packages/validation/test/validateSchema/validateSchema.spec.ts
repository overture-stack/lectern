import { expect } from 'chai';
import type { DataRecord } from '@overture-stack/lectern-dictionary';
import assert from 'node:assert';
import { validateSchema } from '../../src';
import { schemaSingleStringRequired } from '../fixtures/schema/schemaSingleStringRequired';
import { schemaUniqueKey } from '../fixtures/schema/schemaUniqueKey';
import { schemaUniqueString } from '../fixtures/schema/schemaUniqueString';
import { schemaUniqueStringArray } from '../fixtures/schema/schemaUniqueStringArray';
import { schemaUniqueKeyWithArray } from '../fixtures/schema/schemaUniqueKeyWithArray';

describe('Schema - validateSchema', () => {
	describe('Restriction - unique', () => {
		it('Valid for empty data set', () => {
			const records: DataRecord[] = [];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).true;
		});
		it('Valid for single entry', () => {
			const records: DataRecord[] = [{ 'unique-string': 'asdf' }];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).true;
		});
		it('Valid for multiple distinct entires', () => {
			const records: DataRecord[] = [
				{ 'unique-string': 'qwerty' },
				{ 'unique-string': 'uiop' },
				{ 'unique-string': 'asdf' },
				{ 'unique-string': 'ghjkl' },
				{ 'unique-string': 'zxcv' },
				{ 'unique-string': 'bnm' },
			];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).true;
		});
		it('Valid for multiple undefined entires', () => {
			const records: DataRecord[] = [
				{ 'unique-string': 'qwerty' },
				{ 'unique-string': 'uiop' },
				{ 'unique-string': 'asdf' },
				{ 'unique-string': undefined },
				{ 'unique-string': undefined },
				{},
				{},
			];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).true;
		});
		it('Invalid for repeated value', () => {
			const records: DataRecord[] = [
				{ 'unique-string': 'asdf' },
				{ 'unique-string': 'asdf' },
				{ 'unique-string': 'asdf' },
			];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE'),
				'Every invalid record should have a unique restriction error',
			).true;
		});
		// TODO: Test unique on array field
		describe('Array fields', () => {
			it('Valid when arrays have different values', () => {
				const records: DataRecord[] = [
					{ 'unique-string-array': ['qwerty', 'uiop[]'] },
					{ 'unique-string-array': ['asdf'] },
					{ 'unique-string-array': ['ghjkl'] },
					{ 'unique-string-array': ['zxcv', 'bn', 'm,./'] },
				];
				const result = validateSchema(records, schemaUniqueStringArray);
				expect(result.valid).true;
			});
			it('Valid for arrays with same values in different order', () => {
				const records: DataRecord[] = [
					{ 'unique-string-array': ['qwerty'] },
					{ 'unique-string-array': ['uiop[]'] },
					{ 'unique-string-array': ['qwerty', 'uiop[]'] },
					{ 'unique-string-array': ['uiop[]', 'qwerty'] },
					{ 'unique-string-array': ['qwerty', 'uiop[]', 'asdf'] },
					{ 'unique-string-array': ['ghjkl', 'qwerty', 'uiop[]'] },
				];
				const result = validateSchema(records, schemaUniqueStringArray);
				expect(result.valid).true;
			});
			it('Valid with multiple empty arrays', () => {
				// empty arrays are used when no value is provided
				// and records with no value provided should not fail a unique restriction
				const records: DataRecord[] = [
					{ 'unique-string-array': ['qwerty'] },
					{ 'unique-string-array': [] },
					{ 'unique-string-array': [] },
				];
				const result = validateSchema(records, schemaUniqueStringArray);
				expect(result.valid).true;
			});
			it('Rejects arrays with same values in same order', () => {
				const records: DataRecord[] = [
					{ 'unique-string-array': ['qwerty'] },
					{ 'unique-string-array': ['uiop[]'] },

					// duplicate entry x3
					{ 'unique-string-array': ['qwerty', 'uiop[]'] },
					{ 'unique-string-array': ['qwerty', 'uiop[]'] },

					{ 'unique-string-array': ['uiop[]', 'qwerty'] },
					{ 'unique-string-array': ['qwerty', 'uiop[]', 'asdf'] },

					// duplicate entry
					{ 'unique-string-array': ['ghjkl', 'qwerty', 'uiop[]'] },
					{ 'unique-string-array': ['ghjkl', 'qwerty', 'uiop[]'] },

					// third copy of earlier entry
					{ 'unique-string-array': ['qwerty', 'uiop[]'] },
				];
				const result = validateSchema(records, schemaUniqueStringArray);
				expect(result.valid).false;
				assert(result.valid === false);
				expect(result.details.length).equal(5);

				const failedIndices = [2, 3, 6, 7, 8];
				const allIndicesListed = failedIndices.every(
					(index) =>
						result.details.find((error) => error.recordIndex === index)?.recordErrors[0]?.reason ===
						'INVALID_BY_UNIQUE',
				);
				expect(allIndicesListed).true;
			});
		});
	});
	describe('Restriction - uniqueKey', () => {
		// TODO: Test uniqueKey when one or more fields is an array
		it('Valid for empty data set', () => {
			const records: DataRecord[] = [];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).true;
		});
		it('Valid for single entry', () => {
			const records: DataRecord[] = [
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).true;
		});
		it('Valid for entries with distinct unique key values', () => {
			const records: DataRecord[] = [
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'qwerty', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 56.78, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 456, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': false },
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).true;
		});
		it('Valid when one element of unique key value changes to undefined', () => {
			const records: DataRecord[] = [
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': undefined, 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': undefined, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': undefined, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': undefined },
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).true;
		});
		it('Invalid for repeated key', () => {
			const repeatedRecord = { 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true };
			const records: DataRecord[] = [{ ...repeatedRecord }, { ...repeatedRecord }];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY'),
				'Every invalid record should have a uniqueKey error',
			).true;
			assert(
				result.details[0] !== undefined &&
					result.details[0].recordErrors[0] !== undefined &&
					result.details[0].recordErrors[0].reason === 'INVALID_BY_UNIQUE_KEY',
			);
			assert(
				result.details[1] !== undefined &&
					result.details[1].recordErrors[0] !== undefined &&
					result.details[1].recordErrors[0].reason === 'INVALID_BY_UNIQUE_KEY',
			);

			expect(result.details[0].recordErrors[0].uniqueKey).deep.equal({ ...repeatedRecord });
			expect(result.details[0].recordErrors[0].matchingRecords).include(0);
			expect(result.details[0].recordErrors[0].matchingRecords).include(1);

			expect(result.details[1].recordErrors[0].uniqueKey).deep.equal({ ...repeatedRecord });
			expect(result.details[1].recordErrors[0].matchingRecords).include(0);
			expect(result.details[1].recordErrors[0].matchingRecords).include(1);
		});
		it('Invalid for repeated key including an undefined', () => {
			const records: DataRecord[] = [
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': undefined },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': undefined },
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY'),
				'Every invalid record should have a uniqueKey error',
			).true;
		});
		it('Invalid for repeated key with all entries missing/undefined for all unique key fields', () => {
			const records: DataRecord[] = [
				{ 'any-string': undefined, 'any-number': undefined, 'any-integer': undefined, 'any-boolean': undefined },
				{},
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.details.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY'),
				'Every invalid record should have a uniqueKey error',
			).true;
		});
		describe('Array field in uniqueKey', () => {
			it('Valid when unique key has an array field', () => {
				const records: DataRecord[] = [
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['qwerty', 'asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf', 'qwerty'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 56.78, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 456, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': false },
				];
				const result = validateSchema(records, schemaUniqueKeyWithArray);
				expect(result.valid).true;
			});
			it('Invalid when unique key has a repeated array field', () => {
				// first two records are duplicates
				const records: DataRecord[] = [
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 56.78, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 456, 'any-boolean': true },
					{ 'any-string-array': ['asdf'], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': false },
				];
				const result = validateSchema(records, schemaUniqueKeyWithArray);
				expect(result.valid).false;
				assert(result.valid === false);
				expect(result.details.length).equal(2);
			});
			it('Invalid when repeated value is empty array', () => {
				// first two records are duplicates
				const records: DataRecord[] = [
					{ 'any-string-array': [], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': [], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': [], 'any-number': 56.78, 'any-integer': 123, 'any-boolean': true },
					{ 'any-string-array': [], 'any-number': 12.34, 'any-integer': 456, 'any-boolean': true },
					{ 'any-string-array': [], 'any-number': 12.34, 'any-integer': 123, 'any-boolean': false },
				];
				const result = validateSchema(records, schemaUniqueKeyWithArray);
				expect(result.valid).false;
				assert(result.valid === false);
				expect(result.details.length).equal(2);
			});
		});
	});
	describe('Record validations', () => {
		it('Invalid when one record has invalid field values', () => {
			const records: DataRecord[] = [{ 'string-required': 'asdf' }, {}];
			const result = validateSchema(records, schemaSingleStringRequired);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length).equal(1);
			expect(
				result.details[0]?.recordIndex,
				'Invalid record needs to indicate the correct position in the array.',
			).equal(1);
			expect(
				result.details[0]?.recordErrors[0]?.reason,
				'Invalid record needs to indicate it failed by restriction.',
			).equal('INVALID_BY_RESTRICTION');
		});
		it('Invalid when one record has invalid value type', () => {
			const records: DataRecord[] = [
				{ 'string-required': 'asdf' },
				{ 'string-required': 'qwerty' },
				{ 'string-required': 123 }, // invalid value type
			];
			const result = validateSchema(records, schemaSingleStringRequired);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length).equal(1);
			expect(
				result.details[0]?.recordIndex,
				'Invalid record needs to indicate the correct position in the array.',
			).equal(2);
			expect(
				result.details[0]?.recordErrors[0]?.reason,
				'Invalid record needs to indicate it failed by invalid value type.',
			).equal('INVALID_VALUE_TYPE');
		});
		it('Invalid and reporting multiple invalid records, all invalid records are reported', () => {
			const records: DataRecord[] = [
				{ 'string-required': 'asdf' },
				{}, // missing value
				{ 'string-required': 123 }, // invalid value type
				{ 'string-required': '123', 'unknown-field': 123 }, // unrecognized field
			];
			const result = validateSchema(records, schemaSingleStringRequired);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.details.length).equal(3);

			const missingValueRecord = result.details.find(
				(invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_RESTRICTION',
			);
			const invalidValueTypeRecord = result.details.find(
				(invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_VALUE_TYPE',
			);
			const unrecognizedFieldRecord = result.details.find(
				(invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'UNRECOGNIZED_FIELD',
			);

			expect(missingValueRecord).not.undefined;
			assert(missingValueRecord !== undefined);
			expect(invalidValueTypeRecord).not.undefined;
			assert(invalidValueTypeRecord !== undefined);
			expect(unrecognizedFieldRecord).not.undefined;
			assert(unrecognizedFieldRecord !== undefined);

			expect(missingValueRecord.recordIndex, 'Invalid record should report correct index in records array.').equal(1);
			expect(missingValueRecord.recordErrors.length, 'Invalid record should only have a single error.').equal(1);

			expect(invalidValueTypeRecord.recordIndex, 'Invalid record should report correct index in records array.').equal(
				2,
			);
			expect(invalidValueTypeRecord.recordErrors.length, 'Invalid record should only have a single error.').equal(1);

			expect(unrecognizedFieldRecord.recordIndex, 'Invalid record should report correct index in records array.').equal(
				3,
			);
			expect(unrecognizedFieldRecord.recordErrors.length, 'Invalid record should only have a single error.').equal(1);
		});
	});
});

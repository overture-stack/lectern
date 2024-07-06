import { expect } from 'chai';
import { validateSchema } from '../../src';
import { schemaUniqueString } from '../fixtures/schema/schemaUniqueString';
import type { DataRecord, Schema } from 'dictionary';
import assert from 'node:assert';
import { schemaUniqueKey } from '../fixtures/schema/schemaUniqueKey';

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

			expect(result.info.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE'),
				'Every invalid record should have a unique restriction error',
			).true;
		});
	});
	describe('Restriction - uniqueKey', () => {
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
		it('Invalid for repeated key', () => {
			const records: DataRecord[] = [
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
				{ 'any-string': 'asdf', 'any-number': 12.34, 'any-integer': 123, 'any-boolean': true },
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY'),
				'Every invalid record should have a uniqueKey error',
			).true;
		});
		it('Invalid for repeated key with entries missing/undefined for all unique key fields', () => {
			const records: DataRecord[] = [
				{ 'any-string': undefined, 'any-number': undefined, 'any-integer': undefined, 'any-boolean': undefined },
				{},
			];
			const result = validateSchema(records, schemaUniqueKey);
			expect(result.valid).false;
			assert(result.valid === false);

			expect(result.info.length, 'There should be an invalid record for each field with a duplicate value').equal(
				records.length,
			);
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors.length === 1),
				'Each invalid record should have a single error',
			).true;
			expect(
				result.info.every((invalidRecord) => invalidRecord.recordErrors[0]?.reason === 'INVALID_BY_UNIQUE_KEY'),
				'Every invalid record should have a uniqueKey error',
			).true;
		});
	});
	describe('field validations', () => {});
});

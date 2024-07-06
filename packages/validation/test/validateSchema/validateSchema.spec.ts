import { expect } from 'chai';
import { validateSchema } from '../../src';
import { schemaUniqueString } from '../fixtures/schema/schemaUniqueString';
import type { DataRecord } from 'dictionary';
import assert from 'node:assert';

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
			const records: DataRecord[] = [{ 'unique-string': 'asdf' }, { 'unique-string': 'asdf' }];
			const result = validateSchema(records, schemaUniqueString);
			expect(result.valid).false;
			assert(result.valid === false);
		});
	});
	describe('Restriction - uniqueKey', () => {});
	describe('field validations', () => {});
});

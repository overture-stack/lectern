import { expect } from 'chai';
import assert from 'node:assert';
import { testRequired } from '../../../src/validateField/restrictions';

describe('Field - Restrictions - testRequired', () => {
	describe('Restriction is false', () => {
		it('Valid with undefined', () => {
			expect(testRequired(false, undefined).valid).true;
		});
		it('Valid with empty string', () => {
			expect(testRequired(false, '').valid).true;
		});
		it('Valid with empty array', () => {
			expect(testRequired(false, []).valid).true;
		});
		it('Valid with all value types', () => {
			// boolean + boolean[]
			expect(testRequired(false, false).valid).true;
			expect(testRequired(false, true).valid).true;
			expect(testRequired(false, [false]).valid).true;
			// string + string[]
			expect(testRequired(false, 'hello').valid).true;
			expect(testRequired(false, ['hello']).valid).true;
			// number + number[]
			expect(testRequired(false, 0).valid).true;
			expect(testRequired(false, [123]).valid).true;
		});
	});
	describe('Restriction is true', () => {
		it('Valid with any all value types', () => {
			// boolean + boolean[]
			expect(testRequired(true, false).valid).true;
			expect(testRequired(true, true).valid).true;
			expect(testRequired(true, [false]).valid).true;
			// string + string[]
			expect(testRequired(true, 'hello').valid).true;
			expect(testRequired(true, ['hello']).valid).true;
			// number + number[]
			expect(testRequired(true, 0).valid).true;
			expect(testRequired(true, [123]).valid).true;
		});
		it('Invalid with undefined', () => {
			expect(testRequired(true, undefined).valid).false;
		});
		it('Invalid with empty string', () => {
			expect(testRequired(true, '').valid).false;
		});
		it('Invalid with empty array', () => {
			expect(testRequired(true, []).valid).false;
		});
		it('Invalid with array with some missing values', () => {
			expect(testRequired(true, ['hello', '', 'world']).valid).false;
		});
	});
});

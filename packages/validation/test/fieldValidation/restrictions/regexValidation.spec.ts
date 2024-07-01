import { expect } from 'chai';
import { testRegex } from '../../../src/fieldValidation/restrictions';
import { regexYearMonthDay } from '../../fixtures/restrictions/regexFixtures';
import assert from 'assert';

const validDateSingle = '1989-11-09';
const validDateArray = ['1867-07-01', '1969-07-16', '1989-12-17'];

describe('Field - Restrictions - testRegex', () => {
	describe('Single Value', () => {
		it('Valid for matching values', () => {
			expect(testRegex(regexYearMonthDay, validDateSingle).valid).true;
		});
		it('Valid when value is undefined', () => {
			expect(testRegex(regexYearMonthDay, undefined).valid).true;
		});
		it('Valid for non-string types', () => {
			expect(testRegex(regexYearMonthDay, 0).valid).true;
			expect(testRegex(regexYearMonthDay, 123).valid).true;
			expect(testRegex(regexYearMonthDay, 4.56).valid).true;
			expect(testRegex(regexYearMonthDay, true).valid).true;
			expect(testRegex(regexYearMonthDay, false).valid).true;
		});
		it('Invalid for values with incorrect format', () => {
			expect(testRegex(regexYearMonthDay, 'November 9th, 1989').valid).false;
			expect(testRegex(regexYearMonthDay, '19891109').valid).false;
			expect(testRegex(regexYearMonthDay, 'random string	!&^1234').valid).false;
		});
		it('Invalid for empty string', () => {
			expect(testRegex(regexYearMonthDay, '').valid).false;
		});
	});
	describe('Array Value', () => {
		it('Valid for array of matching values', () => {
			expect(testRegex(regexYearMonthDay, validDateArray).valid).true;
			expect(testRegex(regexYearMonthDay, [...validDateArray, validDateSingle]).valid).true;
		});
		it('Valid for empty array', () => {
			expect(testRegex(regexYearMonthDay, []).valid).true;
		});
		it('Invalid when one value in array is invalid', () => {
			expect(testRegex(regexYearMonthDay, ['invalid']).valid).false;
			expect(testRegex(regexYearMonthDay, [...validDateArray, 'invalid', validDateSingle, 'another invalid']).valid)
				.false;
		});

		it('Identifies the invalid items', () => {
			const result = testRegex(regexYearMonthDay, [
				...validDateArray,
				'invalid',
				validDateSingle,
				'another invalid',
				'third invalid',
			]);
			expect(result.valid).false;
			assert(!result.valid);

			expect(Array.isArray(result.info.invalidItems)).true;
			assert(Array.isArray(result.info.invalidItems));

			expect(result.info.invalidItems.length).equal(3);
			expect(result.info.invalidItems[0]?.position).equal(validDateArray.length);
			expect(result.info.invalidItems[0]?.value).equal('invalid');
			expect(result.info.invalidItems[1]?.position).equal(validDateArray.length + 2);
			expect(result.info.invalidItems[1]?.value).equal('another invalid');
			expect(result.info.invalidItems[2]?.position).equal(validDateArray.length + 3);
			expect(result.info.invalidItems[2]?.value).equal('third invalid');
		});
	});
});

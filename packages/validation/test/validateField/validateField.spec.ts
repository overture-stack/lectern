import { expect } from 'chai';
import { validateField } from '../../src';
import { fieldStringNoRestriction } from '../fixtures/fields/noRestrictions/fieldStringNoRestriction';
import assert from 'assert';
import { fieldBooleanNoRestriction } from '../fixtures/fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldIntegerNoRestriction } from '../fixtures/fields/noRestrictions/fieldIntegerNoRestriction';
import { fieldNumberNoRestriction } from '../fixtures/fields/noRestrictions/fieldNumberNoRestriction';
import { fieldStringCodeList } from '../fixtures/fields/simpleRestrictions/string/fieldStringCodeList';
import { fieldStringRegex } from '../fixtures/fields/simpleRestrictions/string/fieldStringRegex';
import { fieldStringRequired } from '../fixtures/fields/simpleRestrictions/string/fieldStringRequired';
import { fieldNumberArrayCodeList } from '../fixtures/fields/simpleRestrictions/number/fieldNumberArrayCodeList';
import { fieldStringArrayRequired } from '../fixtures/fields/simpleRestrictions/string/fieldStringArrayRequired';
import { fieldStringManyRestrictions } from '../fixtures/fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldNumberRange } from '../fixtures/fields/simpleRestrictions/number/fieldNumberRange';
import type { SchemaStringField } from 'dictionary';

const emptyDataRecord = {};

describe('Field - validateField', () => {
	describe('No Restrictions', () => {
		// These validations are on the data value type passed to the validator,
		// and ensuring that undefined values are accepted since these fields do not have a required restriction.
		describe('String type, no restrictions', () => {
			it('Valid for undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldStringNoRestriction).valid).true;
			});
			it('Valid for correct type', () => {
				// String Type
				expect(validateField('asdf', emptyDataRecord, fieldStringNoRestriction).valid).true;
				expect(validateField('', emptyDataRecord, fieldStringNoRestriction).valid).true;
				expect(validateField('2001-02-03', emptyDataRecord, fieldStringNoRestriction).valid).true;
				expect(validateField('this is a story all about how my life', emptyDataRecord, fieldStringNoRestriction).valid)
					.true;
			});
			it('Invalid when given wrong type', () => {
				expect(validateField(123, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(0, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(NaN, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(Infinity, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(true, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(false, emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField([], emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField([false], emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField([123, 456, 789], emptyDataRecord, fieldStringNoRestriction).valid).false;
				expect(validateField(['abc', 'def', 'xyz'], emptyDataRecord, fieldStringNoRestriction).valid).false;
			});
			it('Invalid result for wrong type includes expected type info', () => {
				const testField: SchemaStringField = fieldStringNoRestriction;
				const result = validateField(123, emptyDataRecord, testField);
				expect(result.valid).false;
				assert(!result.valid);

				expect(result.info.reason).equal('INVALID_VALUE_TYPE');
				assert(result.info.reason === 'INVALID_VALUE_TYPE');

				expect(result.info.isArray).equal(!!testField.isArray); // needs the !! to convert to boolean since `testField.isArray` is undefined
				expect(result.info.valueType).equal(testField.valueType);
			});
		});
		describe('Boolean type, no restricitons', () => {
			it('Valid for undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldBooleanNoRestriction).valid).true;
			});
			it('Valid for correct type', () => {
				// String Type
				expect(validateField(true, emptyDataRecord, fieldBooleanNoRestriction).valid).true;
				expect(validateField(false, emptyDataRecord, fieldBooleanNoRestriction).valid).true;
			});
			it('Invalid when given wrong type', () => {
				expect(validateField(123, emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField(0, emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField('true', emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField('false', emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField('random string', emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField([], emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField([false], emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField([123, 456, 789], emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField(['abc', 'def', 'xyz'], emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField(NaN, emptyDataRecord, fieldBooleanNoRestriction).valid).false;
				expect(validateField(Infinity, emptyDataRecord, fieldBooleanNoRestriction).valid).false;
			});
		});
		describe('Integer type, no restricitons', () => {
			it('Valid for undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
			});
			it('Valid for correct type', () => {
				// String Type
				expect(validateField(0, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
				expect(validateField(1, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
				expect(validateField(5.0, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
				expect(validateField(9999, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
				expect(validateField(-10, emptyDataRecord, fieldIntegerNoRestriction).valid).true;
			});
			it('Invalid when given wrong type', () => {
				expect(validateField('random string', emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(123.456, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(-789.01, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(NaN, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(Infinity, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(true, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(false, emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField([], emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField([false], emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField([123, 456, 789], emptyDataRecord, fieldIntegerNoRestriction).valid).false;
				expect(validateField(['abc', 'def', 'xyz'], emptyDataRecord, fieldIntegerNoRestriction).valid).false;
			});
		});
		describe('Number type, no restricitons', () => {
			it('Valid for undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldNumberNoRestriction).valid).true;
			});
			it('Valid for correct type', () => {
				// String Type
				expect(validateField(0, emptyDataRecord, fieldNumberNoRestriction).valid).true;
				expect(validateField(0.0001, emptyDataRecord, fieldNumberNoRestriction).valid).true;
				expect(validateField(1, emptyDataRecord, fieldNumberNoRestriction).valid).true;
				expect(validateField(9999, emptyDataRecord, fieldNumberNoRestriction).valid).true;
				expect(validateField(-10.123, emptyDataRecord, fieldNumberNoRestriction).valid).true;
			});
			it('Invalid when given wrong type', () => {
				expect(validateField('random string', emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField('123.456', emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField(NaN, emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField(Infinity, emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField(true, emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField(false, emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField([], emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField([false], emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField([123, 456, 789], emptyDataRecord, fieldNumberNoRestriction).valid).false;
				expect(validateField(['abc', 'def', 'xyz'], emptyDataRecord, fieldNumberNoRestriction).valid).false;
			});
		});
	});

	describe('Simple Restrictions', () => {
		describe('String with CodeList', () => {
			it('Valid with value in list', () => {
				expect(validateField('apple', emptyDataRecord, fieldStringCodeList).valid).true;
			});
			it('Invalid with value not in list', () => {
				const result = validateField('hockey puck', emptyDataRecord, fieldStringCodeList);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('codeList');
				expect(result.info.errors[0]?.restriction.rule).deep.equal(fieldStringCodeList.restrictions?.codeList);
			});
		});
		describe('String with Regex', () => {
			it('Valid with value matching regex', () => {
				expect(validateField('2063-04-05', emptyDataRecord, fieldStringRegex).valid).true;
			});
			it('Invalid with value not matching regex', () => {
				const result = validateField('April 5, 2063', emptyDataRecord, fieldStringRegex);
				expect(result.valid).false;
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');
				expect(result.info.errors[0]?.restriction.type).equal('regex');
				expect(result.info.errors[0]?.restriction.rule).equal(fieldStringRegex.restrictions?.regex);
			});
		});
		describe('String with Required', () => {
			it('Valid with any string value', () => {
				expect(
					validateField('hello from the past. I hope the future is cool.', emptyDataRecord, fieldStringRequired).valid,
				).true;
			});
			it('Invalid with empty string', () => {
				const testValue = '';
				const result = validateField(testValue, emptyDataRecord, fieldStringRequired);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('required');
				expect(result.info.errors[0]?.restriction.rule).equal(fieldStringRequired.restrictions?.required);
			});
		});
		describe('Number with Range', () => {
			it('Valid with numbers within range', () => {
				// range on test fixture is regexPercent which is min 0, max 100
				expect(validateField(0, emptyDataRecord, fieldNumberRange).valid).true; // extreme value low
				expect(validateField(100, emptyDataRecord, fieldNumberRange).valid).true; // exterme value high
				expect(validateField(10, emptyDataRecord, fieldNumberRange).valid).true;
				expect(validateField(20.1, emptyDataRecord, fieldNumberRange).valid).true;
				expect(validateField(33, emptyDataRecord, fieldNumberRange).valid).true;
				expect(validateField(99, emptyDataRecord, fieldNumberRange).valid).true;
			});
			it('Valid with undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldNumberRange).valid).true;
			});
			it('Invalid with number out of range', () => {
				// range on test fixture is regexPercent which is min 0, max 100
				const result = validateField(101, emptyDataRecord, fieldNumberRange);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('range');
				expect(result.info.errors[0]?.restriction.rule).equal(fieldNumberRange.restrictions?.range);
			});
		});
		describe('String Array with Required', () => {
			it('Valid with array of any string values', () => {
				expect(validateField(['ok'], emptyDataRecord, fieldStringArrayRequired).valid).true;
				expect(validateField(['fine', 'great', 'charmed'], emptyDataRecord, fieldStringArrayRequired).valid).true;
			});

			it('Invalid when array is empty', () => {
				const testValue: string[] = [];
				const result = validateField(testValue, emptyDataRecord, fieldStringArrayRequired);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('required');
				expect(result.info.errors[0]?.restriction.rule).equal(fieldStringArrayRequired.restrictions?.required);
			});
			it('Invalid when array has an empty string', () => {
				const testValue = ['this array has an illegal value', ''];
				const result = validateField(testValue, emptyDataRecord, fieldStringArrayRequired);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('required');
				expect(result.info.errors[0]?.restriction.rule).equal(fieldStringArrayRequired.restrictions?.required);
				expect(Array.isArray(result.info.errors[0]?.invalidItems)).true;
				assert(Array.isArray(result.info.errors[0]?.invalidItems));

				expect(result.info.errors[0]?.invalidItems[0]?.position).equal(1);
				expect(result.info.errors[0]?.invalidItems[0]?.value).equal('');
			});
		});
		describe('Number Array with codeList', () => {
			it('Valid with all values in list', () => {
				expect(validateField([2.41421, 1.61803, 4.23607, 4.23607], emptyDataRecord, fieldNumberArrayCodeList).valid)
					.true;
			});
			it('Valid with empty list', () => {
				expect(validateField([], emptyDataRecord, fieldNumberArrayCodeList).valid).true;
			});
			it('Valid with undefined', () => {
				expect(validateField(undefined, emptyDataRecord, fieldNumberArrayCodeList).valid).true;
			});
			it('Invalid with value not in list', () => {
				const result = validateField(
					[2.41421, 1.61803, 4.23607, 1.61803, 4],
					emptyDataRecord,
					fieldNumberArrayCodeList,
				);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.restriction.type).equal('codeList');
				expect(result.info.errors[0]?.restriction.rule).deep.equal(fieldNumberArrayCodeList.restrictions?.codeList);

				expect(Array.isArray(result.info.errors[0]?.invalidItems)).true;
				assert(Array.isArray(result.info.errors[0]?.invalidItems));

				expect(result.info.errors[0]?.invalidItems[0]?.position).equal(4);
				expect(result.info.errors[0]?.invalidItems[0]?.value).equal(4);
			});
		});
	});
	describe('Multiple Restrictions', () => {
		describe('String with multiple restrictions: required, regex, codeList', () => {
			it('Valid when matching all conditions', () => {
				expect(validateField('2001-01-01', emptyDataRecord, fieldStringManyRestrictions).valid).true;
				expect(validateField('2002-02-02', emptyDataRecord, fieldStringManyRestrictions).valid).true;
				expect(validateField('2003-03-03', emptyDataRecord, fieldStringManyRestrictions).valid).true;
			});
			it('Invalid when failing codeList condition', () => {
				const result = validateField('1999-01-02', emptyDataRecord, fieldStringManyRestrictions);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.restriction.type).equal('codeList');
				expect(result.info.errors[0]?.restriction.rule).deep.equal(fieldStringManyRestrictions.restrictions?.codeList);
			});
			it('Invalid when failing regex condition', () => {
				const result = validateField('April 4, 2004', emptyDataRecord, fieldStringManyRestrictions);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.restriction.type).equal('regex');
				expect(result.info.errors[0]?.restriction.rule).deep.equal(fieldStringManyRestrictions.restrictions?.regex);
			});
			it('Invalid when failing required condition', () => {
				const result = validateField(undefined, emptyDataRecord, fieldStringManyRestrictions);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(1);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.invalidItems).undefined;
				expect(result.info.errors[0]?.restriction.type).equal('required');
				expect(result.info.errors[0]?.restriction.rule).deep.equal(fieldStringManyRestrictions.restrictions?.required);
			});
			it('Invalid when failing regex and codeList restrictions', () => {
				const result = validateField('this value is wrong', emptyDataRecord, fieldStringManyRestrictions);
				expect(result.valid).false;
				assert(result.valid === false);

				expect(result.info.reason).equal('INVALID_BY_RESTRICTION');
				assert(result.info.reason === 'INVALID_BY_RESTRICTION');

				expect(result.info.errors.length).equal(2);
				expect(result.info.errors[0]?.message).not.undefined;
				expect(result.info.errors[0]?.invalidItems).undefined;
				const errors = result.info.errors;
				const regexError = errors.find(
					(error) =>
						error.restriction.type === 'regex' &&
						error.restriction.rule === fieldStringManyRestrictions.restrictions?.regex,
				);
				expect(regexError).exist;
				const codeListError = errors.find(
					(error) =>
						error.restriction.type === 'codeList' &&
						error.restriction.rule === fieldStringManyRestrictions.restrictions?.codeList,
				);
				expect(codeListError).exist;
			});
		});
	});
});

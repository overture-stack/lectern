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
import { convertFieldValue } from '../../src/convertValues';
import { fieldStringNoRestriction } from '../fixtures/fields/noRestrictions/fieldStringNoRestriction';
import { fieldNumberNoRestriction } from '../fixtures/fields/noRestrictions/fieldNumberNoRestriction';
import { fieldIntegerNoRestriction } from '../fixtures/fields/noRestrictions/fieldIntegerNoRestriction';
import { fieldBooleanNoRestriction } from '../fixtures/fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldStringArrayRequired } from '../fixtures/fields/simpleRestrictions/string/fieldStringArrayRequired';
import { fieldNumberArrayCodeList } from '../fixtures/fields/simpleRestrictions/number/fieldNumberArrayCodeList';
import { fieldIntegerArrayRequired } from '../fixtures/fields/simpleRestrictions/integer/fieldIntegerArrayRequired';
import { fieldBooleanArrayRequired } from '../fixtures/fields/simpleRestrictions/boolean/fieldBooleanArrayRequired';
import { fieldStringCodeList } from '../fixtures/fields/simpleRestrictions/string/fieldStringCodeList';
import { codeListString } from '../fixtures/restrictions/codeListsFixtures';
import { fieldStringArrayCodeList } from '../fixtures/fields/simpleRestrictions/string/fieldStringArrayCodeList';

describe('Convert Values - convertFieldValue', () => {
	describe('Single Value Fields', () => {
		it('All field types successfully converts strings of only whitespace to `undefined`', () => {
			expect(convertFieldValue('', fieldStringNoRestriction).success).true;
			expect(convertFieldValue('', fieldStringNoRestriction).data).undefined;
			expect(convertFieldValue(' ', fieldStringNoRestriction).success).true;
			expect(convertFieldValue(' ', fieldStringNoRestriction).data).undefined;

			expect(convertFieldValue('', fieldNumberNoRestriction).success).true;
			expect(convertFieldValue('', fieldNumberNoRestriction).data).undefined;
			expect(convertFieldValue(' ', fieldNumberNoRestriction).success).true;
			expect(convertFieldValue(' ', fieldNumberNoRestriction).data).undefined;

			expect(convertFieldValue('', fieldIntegerNoRestriction).success).true;
			expect(convertFieldValue('', fieldIntegerNoRestriction).data).undefined;
			expect(convertFieldValue(' ', fieldIntegerNoRestriction).success).true;
			expect(convertFieldValue(' ', fieldIntegerNoRestriction).data).undefined;

			expect(convertFieldValue('', fieldBooleanNoRestriction).success).true;
			expect(convertFieldValue('', fieldBooleanNoRestriction).data).undefined;
			expect(convertFieldValue(' ', fieldBooleanNoRestriction).success).true;
			expect(convertFieldValue(' ', fieldBooleanNoRestriction).data).undefined;

			expect(convertFieldValue('			  	 	 	 ', fieldStringNoRestriction).success).true;
			expect(convertFieldValue('			  	 	 	 ', fieldStringNoRestriction).data).undefined;
		});

		describe('Boolean', () => {
			it('Boolean field successfully converts booleans, case insensitive', () => {
				const resultTrue = convertFieldValue('true', fieldBooleanNoRestriction);
				expect(resultTrue.success).true;
				expect(resultTrue.data).equal(true);

				const resultFalse = convertFieldValue('false', fieldBooleanNoRestriction);
				expect(resultFalse.success).true;
				expect(resultFalse.data).equal(false);

				expect(convertFieldValue('False', fieldBooleanNoRestriction).success).true;
				expect(convertFieldValue('False', fieldBooleanNoRestriction).data).equals(false);
				expect(convertFieldValue('TRUE', fieldBooleanNoRestriction).success).true;
				expect(convertFieldValue('TRUE', fieldBooleanNoRestriction).data).equals(true);
				expect(convertFieldValue('tRuE', fieldBooleanNoRestriction).success).true;
				expect(convertFieldValue('tRuE', fieldBooleanNoRestriction).data).equals(true);
			});
			it('Boolean field successfully converts value with whitespace', () => {
				const resultTrue = convertFieldValue('   TRUE', fieldBooleanNoRestriction);
				expect(resultTrue.success).true;
				expect(resultTrue.data).equal(true);

				const resultFalse = convertFieldValue('       False    ', fieldBooleanNoRestriction);
				expect(resultFalse.success).true;
				expect(resultFalse.data).equal(false);
			});
			it('Boolean field rejects non boolean strings', () => {
				expect(convertFieldValue('hello world', fieldBooleanNoRestriction).success).false;
				expect(convertFieldValue(',', fieldBooleanNoRestriction).success).false;
				expect(convertFieldValue('falso', fieldBooleanNoRestriction).success).false;
			});
		});

		describe('Integer', () => {
			it('Integer field successfully converts integers', () => {
				const value = '12345';
				const result = convertFieldValue(value, fieldIntegerNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(Number(value));

				expect(convertFieldValue('100', fieldIntegerNoRestriction).success).true;
				expect(convertFieldValue('100', fieldIntegerNoRestriction).data).equals(100);
				expect(convertFieldValue('-99999999', fieldIntegerNoRestriction).success).true;
				expect(convertFieldValue('-99999999', fieldIntegerNoRestriction).data).equals(-99999999);
				expect(convertFieldValue('180.00', fieldIntegerNoRestriction).success).true;
				expect(convertFieldValue('180.00', fieldIntegerNoRestriction).data).equals(180);
			});
			it('Integer field rejects non integer values', () => {
				expect(convertFieldValue('100.01', fieldIntegerNoRestriction).success).false;
				expect(convertFieldValue('-99999.999', fieldIntegerNoRestriction).success).false;
			});
			it('Integer field rejects non numeric strings', () => {
				expect(convertFieldValue('another one', fieldIntegerNoRestriction).success).false;
				expect(convertFieldValue(',', fieldIntegerNoRestriction).success).false;
				expect(convertFieldValue('12.34.56', fieldIntegerNoRestriction).success).false;
			});
			it('Integer field rejects Infinity', () => {
				expect(convertFieldValue('Infinity', fieldIntegerNoRestriction).success).false;
				expect(convertFieldValue('-Infinity', fieldIntegerNoRestriction).success).false;
			});
			it('Intger field rejects NaN', () => {
				expect(convertFieldValue('NaN', fieldIntegerNoRestriction).success).false;
			});
		});

		describe('Number', () => {
			it('Number field successfully converts numbers', () => {
				const value = '123.45';
				const result = convertFieldValue(value, fieldNumberNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(Number(value));

				expect(convertFieldValue('100', fieldNumberNoRestriction).success).true;
				expect(convertFieldValue('100', fieldNumberNoRestriction).data).equals(100);
				expect(convertFieldValue('-99999999', fieldNumberNoRestriction).success).true;
				expect(convertFieldValue('-99999999.99', fieldNumberNoRestriction).data).equals(-99999999.99);
				expect(convertFieldValue('-0', fieldNumberNoRestriction).success).true;
				expect(convertFieldValue('-0', fieldNumberNoRestriction).data).equals(0);
			});
			it('Number field rejects non numeric strings', () => {
				expect(convertFieldValue('hello world', fieldNumberNoRestriction).success).false;
				expect(convertFieldValue(',', fieldNumberNoRestriction).success).false;
				expect(convertFieldValue('one', fieldNumberNoRestriction).success).false;
			});
			it('Number field rejects Infinity', () => {
				expect(convertFieldValue('Infinity', fieldNumberNoRestriction).success).false;
				expect(convertFieldValue('-Infinity', fieldNumberNoRestriction).success).false;
			});
			it('Number field rejects NaN', () => {
				expect(convertFieldValue('NaN', fieldNumberNoRestriction).success).false;
			});
		});

		describe('String', () => {
			it('Succesfuly converts strings, returning trimmed value', () => {
				const value = 'any random string value!!!';
				const result = convertFieldValue(value, fieldStringNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(value);

				expect(convertFieldValue('    123', fieldStringNoRestriction).success).true;
				expect(convertFieldValue('    123', fieldStringNoRestriction).data).equals('123');
				expect(convertFieldValue('false   ', fieldStringNoRestriction).success).true;
				expect(convertFieldValue('false   ', fieldStringNoRestriction).data).equals('false');
				expect(convertFieldValue('     !@#$%^&* ()_+      ', fieldStringNoRestriction).success).true;
				expect(convertFieldValue('     !@#$%^&* ()_+      ', fieldStringNoRestriction).data).equals('!@#$%^&* ()_+');
			});
			it('Updates string to match formatting of codeList value', () => {
				const value = 'banana';
				const result = convertFieldValue(value, fieldStringCodeList);
				expect(result.success).true;
				expect(result.data).equal(codeListString[1]);
			});
		});
	});
	describe('Arrays', () => {
		it('Converts strings of only whitespace to `[]`', () => {
			expect(convertFieldValue('', fieldStringArrayRequired).success).true;
			expect(convertFieldValue('', fieldStringArrayRequired).data).deep.equals([]);
			expect(convertFieldValue('  ', fieldStringArrayRequired).success).true;
			expect(convertFieldValue('  ', fieldStringArrayRequired).data).deep.equals([]);

			expect(convertFieldValue('', fieldNumberArrayCodeList).success).true;
			expect(convertFieldValue('', fieldNumberArrayCodeList).data).deep.equals([]);
			expect(convertFieldValue('  ', fieldNumberArrayCodeList).success).true;
			expect(convertFieldValue('  ', fieldNumberArrayCodeList).data).deep.equals([]);

			expect(convertFieldValue('', fieldIntegerArrayRequired).success).true;
			expect(convertFieldValue('', fieldIntegerArrayRequired).data).deep.equals([]);
			expect(convertFieldValue('  ', fieldIntegerArrayRequired).success).true;
			expect(convertFieldValue('  ', fieldIntegerArrayRequired).data).deep.equals([]);

			expect(convertFieldValue('', fieldBooleanArrayRequired).success).true;
			expect(convertFieldValue('', fieldBooleanArrayRequired).data).deep.equals([]);
			expect(convertFieldValue('  ', fieldBooleanArrayRequired).success).true;
			expect(convertFieldValue('  ', fieldBooleanArrayRequired).data).deep.equals([]);

			expect(convertFieldValue('			  	 	 	 ', fieldStringArrayRequired).success).true;
			expect(convertFieldValue('			  	 	 	 ', fieldStringArrayRequired).data).deep.equals([]);
		});
		it('Rejects arrays with trailing delimiter', () => {
			const stringResult = convertFieldValue('first,second,third,', fieldStringArrayRequired);
			expect(stringResult.success).false;

			const numberResult = convertFieldValue('123,0.123,4567.89,', fieldNumberArrayCodeList);
			expect(numberResult.success).false;

			const integerResult = convertFieldValue('123,', fieldIntegerArrayRequired);
			expect(integerResult.success).false;

			const booleanResult = convertFieldValue('true,true,false,', fieldBooleanArrayRequired);
			expect(booleanResult.success).false;
		});
		it('Rejects arrays with leading delimiter', () => {
			const stringResult = convertFieldValue(',first,second,third', fieldStringArrayRequired);
			expect(stringResult.success).false;

			const numberResult = convertFieldValue(',123,0.123,4567.89', fieldNumberArrayCodeList);
			expect(numberResult.success).false;

			const integerResult = convertFieldValue(',123', fieldIntegerArrayRequired);
			expect(integerResult.success).false;

			const booleanResult = convertFieldValue(',true,true,false', fieldBooleanArrayRequired);
			expect(booleanResult.success).false;
		});
		it('Rejects value of only delimiter', () => {
			expect(convertFieldValue(',', fieldStringArrayRequired).success).false;

			expect(convertFieldValue(',', fieldNumberArrayCodeList).success).false;

			expect(convertFieldValue(',', fieldIntegerArrayRequired).success).false;

			expect(convertFieldValue(',', fieldBooleanArrayRequired).success).false;
		});
		describe('String array', () => {
			it('Successfully splits string into array', () => {
				const result = convertFieldValue('first,second,third,fourth', fieldStringArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equal(['first', 'second', 'third', 'fourth']);
			});
			it('Successfully trims each value', () => {
				const result = convertFieldValue('    first    , second    , third,    fourth     ', fieldStringArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equal(['first', 'second', 'third', 'fourth']);
			});
			it('Rejects array with missing values (two delimiters are adjacent)', () => {
				const result = convertFieldValue('first,second,   ,,fourth', fieldStringArrayRequired);
				expect(result.success).false;
			});
			it('For field with code list, updates value formatting to match codeList', () => {
				const value = 'apple, banana, carrot, donut, elephant';
				const result = convertFieldValue(value, fieldStringArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equal([...codeListString, 'elephant']);
			});
		});
		describe('Integer array', () => {
			it('Successfully converts array', () => {
				const result = convertFieldValue('12,45,-111111', fieldIntegerArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([12, 45, -111111]);
			});
			it('Successfully converts values with whitespace', () => {
				const result = convertFieldValue('  23 , -556555 ,    0     ', fieldIntegerArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([23, -556555, 0]);
			});
			it('Rejects array where value is missing (two delimiters are adjacent)', () => {
				const result = convertFieldValue('12,   45,,-111111', fieldIntegerArrayRequired);
				expect(result.success).false;
			});
		});
		describe('Number array', () => {
			it('Number array field, successfully converts array', () => {
				const result = convertFieldValue('12,0.45,-111.111', fieldNumberArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equals([12, 0.45, -111.111]);
			});
			it('Number array field, successfully converts values with whitespace', () => {
				const result = convertFieldValue('  23 , -556.555 ,    0.0     ', fieldNumberArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equals([23, -556.555, 0]);
			});
			it('Number array field, rejects array where value is missing (two delimiters are adjacent)', () => {
				const result = convertFieldValue('12,   0.45,,-111.111', fieldNumberArrayCodeList);
				expect(result.success).false;
			});
		});
		describe('Bolean array', () => {
			it('Boolean array field, successfully converts array', () => {
				const result = convertFieldValue('true,false,TRUE', fieldBooleanArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([true, false, true]);
			});
			it('Boolean array field, rejects array where value is missing (two delimiters are adjacent)', () => {
				expect(convertFieldValue('true,false,,TRUE', fieldBooleanArrayRequired).success).false;
				expect(convertFieldValue('true,false,TRUE,,', fieldBooleanArrayRequired).success).false;
			});
			it('Boolean array field, rejects array where value is missing (two delimiters are adjacent)');
			expect(convertFieldValue(',true,false,TRUE', fieldBooleanArrayRequired).success).false;
		});
	});
});

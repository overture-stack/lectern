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
import { parseFieldValue } from '../../src/parseValues';
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
import { fieldStringConditionalExists } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalExists';
import { fieldStringConditionalExistsWithouthThenElse } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalExistsWithoutThenElse';

describe('Parse Values - parseFieldValue', () => {
	describe('Single Value Fields', () => {
		it('All field types successfully parses strings of only whitespace as `undefined`', () => {
			expect(parseFieldValue('', fieldStringNoRestriction).success).true;
			expect(parseFieldValue('', fieldStringNoRestriction).data).undefined;
			expect(parseFieldValue(' ', fieldStringNoRestriction).success).true;
			expect(parseFieldValue(' ', fieldStringNoRestriction).data).undefined;

			expect(parseFieldValue('', fieldNumberNoRestriction).success).true;
			expect(parseFieldValue('', fieldNumberNoRestriction).data).undefined;
			expect(parseFieldValue(' ', fieldNumberNoRestriction).success).true;
			expect(parseFieldValue(' ', fieldNumberNoRestriction).data).undefined;

			expect(parseFieldValue('', fieldIntegerNoRestriction).success).true;
			expect(parseFieldValue('', fieldIntegerNoRestriction).data).undefined;
			expect(parseFieldValue(' ', fieldIntegerNoRestriction).success).true;
			expect(parseFieldValue(' ', fieldIntegerNoRestriction).data).undefined;

			expect(parseFieldValue('', fieldBooleanNoRestriction).success).true;
			expect(parseFieldValue('', fieldBooleanNoRestriction).data).undefined;
			expect(parseFieldValue(' ', fieldBooleanNoRestriction).success).true;
			expect(parseFieldValue(' ', fieldBooleanNoRestriction).data).undefined;

			expect(parseFieldValue('			  	 	 	 ', fieldStringNoRestriction).success).true;
			expect(parseFieldValue('			  	 	 	 ', fieldStringNoRestriction).data).undefined;
		});

		describe('Boolean', () => {
			it('Boolean field successfully parses booleans, case insensitive', () => {
				const resultTrue = parseFieldValue('true', fieldBooleanNoRestriction);
				expect(resultTrue.success).true;
				expect(resultTrue.data).equal(true);

				const resultFalse = parseFieldValue('false', fieldBooleanNoRestriction);
				expect(resultFalse.success).true;
				expect(resultFalse.data).equal(false);

				expect(parseFieldValue('False', fieldBooleanNoRestriction).success).true;
				expect(parseFieldValue('False', fieldBooleanNoRestriction).data).equals(false);
				expect(parseFieldValue('TRUE', fieldBooleanNoRestriction).success).true;
				expect(parseFieldValue('TRUE', fieldBooleanNoRestriction).data).equals(true);
				expect(parseFieldValue('tRuE', fieldBooleanNoRestriction).success).true;
				expect(parseFieldValue('tRuE', fieldBooleanNoRestriction).data).equals(true);
			});
			it('Boolean field successfully parses value with whitespace', () => {
				const resultTrue = parseFieldValue('   TRUE', fieldBooleanNoRestriction);
				expect(resultTrue.success).true;
				expect(resultTrue.data).equal(true);

				const resultFalse = parseFieldValue('       False    ', fieldBooleanNoRestriction);
				expect(resultFalse.success).true;
				expect(resultFalse.data).equal(false);
			});
			it('Boolean field rejects non boolean strings', () => {
				expect(parseFieldValue('hello world', fieldBooleanNoRestriction).success).false;
				expect(parseFieldValue(',', fieldBooleanNoRestriction).success).false;
				expect(parseFieldValue('falso', fieldBooleanNoRestriction).success).false;
			});
		});

		describe('Integer', () => {
			it('Integer field successfully parses integers', () => {
				const value = '12345';
				const result = parseFieldValue(value, fieldIntegerNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(Number(value));

				expect(parseFieldValue('100', fieldIntegerNoRestriction).success).true;
				expect(parseFieldValue('100', fieldIntegerNoRestriction).data).equals(100);
				expect(parseFieldValue('-99999999', fieldIntegerNoRestriction).success).true;
				expect(parseFieldValue('-99999999', fieldIntegerNoRestriction).data).equals(-99999999);
				expect(parseFieldValue('180.00', fieldIntegerNoRestriction).success).true;
				expect(parseFieldValue('180.00', fieldIntegerNoRestriction).data).equals(180);
			});
			it('Integer field rejects non integer values', () => {
				expect(parseFieldValue('100.01', fieldIntegerNoRestriction).success).false;
				expect(parseFieldValue('-99999.999', fieldIntegerNoRestriction).success).false;
			});
			it('Integer field rejects non numeric strings', () => {
				expect(parseFieldValue('another one', fieldIntegerNoRestriction).success).false;
				expect(parseFieldValue(',', fieldIntegerNoRestriction).success).false;
				expect(parseFieldValue('12.34.56', fieldIntegerNoRestriction).success).false;
			});
			it('Integer field rejects Infinity', () => {
				expect(parseFieldValue('Infinity', fieldIntegerNoRestriction).success).false;
				expect(parseFieldValue('-Infinity', fieldIntegerNoRestriction).success).false;
			});
			it('Intger field rejects NaN', () => {
				expect(parseFieldValue('NaN', fieldIntegerNoRestriction).success).false;
			});
		});

		describe('Number', () => {
			it('Number field successfully parses numbers', () => {
				const value = '123.45';
				const result = parseFieldValue(value, fieldNumberNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(Number(value));

				expect(parseFieldValue('100', fieldNumberNoRestriction).success).true;
				expect(parseFieldValue('100', fieldNumberNoRestriction).data).equals(100);
				expect(parseFieldValue('-99999999', fieldNumberNoRestriction).success).true;
				expect(parseFieldValue('-99999999.99', fieldNumberNoRestriction).data).equals(-99999999.99);
				expect(parseFieldValue('-0', fieldNumberNoRestriction).success).true;
				expect(parseFieldValue('-0', fieldNumberNoRestriction).data).equals(0);
			});
			it('Number field rejects non numeric strings', () => {
				expect(parseFieldValue('hello world', fieldNumberNoRestriction).success).false;
				expect(parseFieldValue(',', fieldNumberNoRestriction).success).false;
				expect(parseFieldValue('one', fieldNumberNoRestriction).success).false;
			});
			it('Number field rejects Infinity', () => {
				expect(parseFieldValue('Infinity', fieldNumberNoRestriction).success).false;
				expect(parseFieldValue('-Infinity', fieldNumberNoRestriction).success).false;
			});
			it('Number field rejects NaN', () => {
				expect(parseFieldValue('NaN', fieldNumberNoRestriction).success).false;
			});
		});

		describe('String', () => {
			it('Succesfuly parses strings, returning trimmed value', () => {
				const value = 'any random string value!!!';
				const result = parseFieldValue(value, fieldStringNoRestriction);
				expect(result.success).true;
				expect(result.data).equal(value);

				expect(parseFieldValue('    123', fieldStringNoRestriction).success).true;
				expect(parseFieldValue('    123', fieldStringNoRestriction).data).equals('123');
				expect(parseFieldValue('false   ', fieldStringNoRestriction).success).true;
				expect(parseFieldValue('false   ', fieldStringNoRestriction).data).equals('false');
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringNoRestriction).success).true;
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringNoRestriction).data).equals('!@#$%^&* ()_+');
			});
			it('Successfuly parses strings, with conditional restrictions', () => {
				const value = 'any random string value!!!';
				const result = parseFieldValue(value, fieldStringConditionalExists);
				expect(result.success).true;
				expect(result.data).equal(value);

				expect(parseFieldValue('    123', fieldStringConditionalExists).success).true;
				expect(parseFieldValue('    123', fieldStringConditionalExists).data).equals('123');
				expect(parseFieldValue('false   ', fieldStringConditionalExists).success).true;
				expect(parseFieldValue('false   ', fieldStringConditionalExists).data).equals('false');
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringConditionalExists).success).true;
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringConditionalExists).data).equals('!@#$%^&* ()_+');
			});
			it('Successfuly parses strings, with conditional restrictions without then or else', () => {
				const value = 'any random string value!!!';
				const result = parseFieldValue(value, fieldStringConditionalExistsWithouthThenElse);
				expect(result.success).true;
				expect(result.data).equal(value);

				expect(parseFieldValue('    123', fieldStringConditionalExistsWithouthThenElse).success).true;
				expect(parseFieldValue('    123', fieldStringConditionalExistsWithouthThenElse).data).equals('123');
				expect(parseFieldValue('false   ', fieldStringConditionalExistsWithouthThenElse).success).true;
				expect(parseFieldValue('false   ', fieldStringConditionalExistsWithouthThenElse).data).equals('false');
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringConditionalExistsWithouthThenElse).success).true;
				expect(parseFieldValue('     !@#$%^&* ()_+      ', fieldStringConditionalExistsWithouthThenElse).data).equals(
					'!@#$%^&* ()_+',
				);
			});
			it('Updates string to match formatting of codeList value', () => {
				const value = 'banana';
				const result = parseFieldValue(value, fieldStringCodeList);
				expect(result.success).true;
				expect(result.data).equal(codeListString[1]);
			});
		});
	});
	describe('Arrays', () => {
		it('Parses strings of only whitespace to `[]`', () => {
			expect(parseFieldValue('', fieldStringArrayRequired).success).true;
			expect(parseFieldValue('', fieldStringArrayRequired).data).deep.equals([]);
			expect(parseFieldValue('  ', fieldStringArrayRequired).success).true;
			expect(parseFieldValue('  ', fieldStringArrayRequired).data).deep.equals([]);

			expect(parseFieldValue('', fieldNumberArrayCodeList).success).true;
			expect(parseFieldValue('', fieldNumberArrayCodeList).data).deep.equals([]);
			expect(parseFieldValue('  ', fieldNumberArrayCodeList).success).true;
			expect(parseFieldValue('  ', fieldNumberArrayCodeList).data).deep.equals([]);

			expect(parseFieldValue('', fieldIntegerArrayRequired).success).true;
			expect(parseFieldValue('', fieldIntegerArrayRequired).data).deep.equals([]);
			expect(parseFieldValue('  ', fieldIntegerArrayRequired).success).true;
			expect(parseFieldValue('  ', fieldIntegerArrayRequired).data).deep.equals([]);

			expect(parseFieldValue('', fieldBooleanArrayRequired).success).true;
			expect(parseFieldValue('', fieldBooleanArrayRequired).data).deep.equals([]);
			expect(parseFieldValue('  ', fieldBooleanArrayRequired).success).true;
			expect(parseFieldValue('  ', fieldBooleanArrayRequired).data).deep.equals([]);

			expect(parseFieldValue('			  	 	 	 ', fieldStringArrayRequired).success).true;
			expect(parseFieldValue('			  	 	 	 ', fieldStringArrayRequired).data).deep.equals([]);
		});
		it('Rejects arrays with trailing delimiter', () => {
			const stringResult = parseFieldValue('first,second,third,', fieldStringArrayRequired);
			expect(stringResult.success).false;

			const numberResult = parseFieldValue('123,0.123,4567.89,', fieldNumberArrayCodeList);
			expect(numberResult.success).false;

			const integerResult = parseFieldValue('123,', fieldIntegerArrayRequired);
			expect(integerResult.success).false;

			const booleanResult = parseFieldValue('true,true,false,', fieldBooleanArrayRequired);
			expect(booleanResult.success).false;
		});
		it('Rejects arrays with leading delimiter', () => {
			const stringResult = parseFieldValue(',first,second,third', fieldStringArrayRequired);
			expect(stringResult.success).false;

			const numberResult = parseFieldValue(',123,0.123,4567.89', fieldNumberArrayCodeList);
			expect(numberResult.success).false;

			const integerResult = parseFieldValue(',123', fieldIntegerArrayRequired);
			expect(integerResult.success).false;

			const booleanResult = parseFieldValue(',true,true,false', fieldBooleanArrayRequired);
			expect(booleanResult.success).false;
		});
		it('Rejects value of only delimiter', () => {
			expect(parseFieldValue(',', fieldStringArrayRequired).success).false;

			expect(parseFieldValue(',', fieldNumberArrayCodeList).success).false;

			expect(parseFieldValue(',', fieldIntegerArrayRequired).success).false;

			expect(parseFieldValue(',', fieldBooleanArrayRequired).success).false;
		});
		describe('String array', () => {
			it('Successfully splits string into array', () => {
				const result = parseFieldValue('first,second,third,fourth', fieldStringArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equal(['first', 'second', 'third', 'fourth']);
			});
			it('Successfully trims each value', () => {
				const result = parseFieldValue('    first    , second    , third,    fourth     ', fieldStringArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equal(['first', 'second', 'third', 'fourth']);
			});
			it('Rejects array with missing values (two delimiters are adjacent)', () => {
				const result = parseFieldValue('first,second,   ,,fourth', fieldStringArrayRequired);
				expect(result.success).false;
			});
			it('For field with code list, updates value formatting to match codeList', () => {
				const value = 'apple, banana, carrot, donut, elephant';
				const result = parseFieldValue(value, fieldStringArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equal([...codeListString, 'elephant']);
			});
		});
		describe('Integer array', () => {
			it('Successfully parses array', () => {
				const result = parseFieldValue('12,45,-111111', fieldIntegerArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([12, 45, -111111]);
			});
			it('Successfully parses values with whitespace', () => {
				const result = parseFieldValue('  23 , -556555 ,    0     ', fieldIntegerArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([23, -556555, 0]);
			});
			it('Rejects array where value is missing (two delimiters are adjacent)', () => {
				const result = parseFieldValue('12,   45,,-111111', fieldIntegerArrayRequired);
				expect(result.success).false;
			});
		});
		describe('Number array', () => {
			it('Number array field, successfully parses array', () => {
				const result = parseFieldValue('12,0.45,-111.111', fieldNumberArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equals([12, 0.45, -111.111]);
			});
			it('Number array field, successfully parses values with whitespace', () => {
				const result = parseFieldValue('  23 , -556.555 ,    0.0     ', fieldNumberArrayCodeList);
				expect(result.success).true;
				expect(result.data).deep.equals([23, -556.555, 0]);
			});
			it('Number array field, rejects array where value is missing (two delimiters are adjacent)', () => {
				const result = parseFieldValue('12,   0.45,,-111.111', fieldNumberArrayCodeList);
				expect(result.success).false;
			});
		});
		describe('Bolean array', () => {
			it('Boolean array field, successfully parses array', () => {
				const result = parseFieldValue('true,false,TRUE', fieldBooleanArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equals([true, false, true]);
			});
			it('Boolean array field, rejects array where value is missing (two delimiters are adjacent)', () => {
				expect(parseFieldValue('true,false,,TRUE', fieldBooleanArrayRequired).success).false;
				expect(parseFieldValue('true,false,TRUE,,', fieldBooleanArrayRequired).success).false;
			});
			it('Boolean array field, rejects array where value is missing (two delimiters are adjacent)');
			expect(parseFieldValue(',true,false,TRUE', fieldBooleanArrayRequired).success).false;
		});
		describe('Custom delimiter', () => {
			it('Uses a `,` as the delimiter when none is defined', () => {
				const result = parseFieldValue(':,_,|,/', fieldStringArrayRequired);
				expect(result.success).true;
				expect(result.data).deep.equal([':', '_', '|', '/']);
			});
			it('Splits array on the delimiter when defined', () => {
				const customDelimiterField = { ...fieldStringArrayRequired, delimiter: '|' };
				const result = parseFieldValue(':,_,|,/', customDelimiterField);
				expect(result.success).true;
				expect(result.data).deep.equal([':,_,', ',/']);

				const result2 = parseFieldValue('abc|def|ghi', customDelimiterField);
				expect(result2.success).true;
				expect(result2.data).deep.equal(['abc', 'def', 'ghi']);
			});
			it('Splits arrays with delimiters with more than 1 character', () => {
				const customDelimiterField = { ...fieldStringArrayRequired, delimiter: '-/-' };
				const result = parseFieldValue('a-/-b-/-c-/-d', customDelimiterField);
				expect(result.success).true;
				expect(result.data).deep.equal(['a', 'b', 'c', 'd']);
			});
			it('Splits arrays with delimiters that are entirely whitespace', () => {
				const customDelimiterField = { ...fieldStringArrayRequired, delimiter: '   ' };
				const result = parseFieldValue('a   b   c   d', customDelimiterField);
				expect(result.success).true;
				expect(result.data).deep.equal(['a', 'b', 'c', 'd']);
			});
		});
	});
});

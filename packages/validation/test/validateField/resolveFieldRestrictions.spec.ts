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

import { ARRAY_TEST_CASE_DEFAULT, type DataRecord } from '@overture-stack/lectern-dictionary';
import assert from 'assert';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { resolveFieldRestrictions } from '../../src/validateField/restrictions/resolveFieldRestrictions';
import { fieldStringConditionalExists } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalExists';
import { fieldStringConditionalMultipleConditions } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalMultipleConditions';
import { fieldStringConditionalMultipleFieldsRegex } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalMultipleFieldsRegex';
import { fieldStringNestedConditional } from '../fixtures/fields/conditionalRestrictions/fieldStringNestedConditional';
import { fieldStringRequiredConditionalRange } from '../fixtures/fields/conditionalRestrictions/fieldStringRequiredConditionalRange';
import { fieldStringArrayMultipleRegex } from '../fixtures/fields/multipleRestrictions/fieldStringArrayMultipleRegex';
import { fieldStringManyRestrictions } from '../fixtures/fields/multipleRestrictions/fieldStringManyRestrictions';
import { fieldBooleanNoRestriction } from '../fixtures/fields/noRestrictions/fieldBooleanNoRestriction';
import { fieldNumberNoRestriction } from '../fixtures/fields/noRestrictions/fieldNumberNoRestriction';
import { fieldStringNoRestriction } from '../fixtures/fields/noRestrictions/fieldStringNoRestriction';
import { regexAlphaOnly } from '../fixtures/restrictions/regexFixtures';
import { fieldStringConditionalExistsWithouthThenElse } from '../fixtures/fields/conditionalRestrictions/fieldStringConditionalExistsWithoutThenElse';

describe('Field - resolveFieldRestrictions', () => {
	it('Returns empty array when there are no restrictions', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringNoRestriction);
		expect(restrictions.length).equal(0);
	});
	it('Returns array with rules matching restrictions in a single restrictions object', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringManyRestrictions);
		expect(restrictions.length).equal(3);
		const regexRestriction = restrictions.find((restriction) => restriction.type === 'regex');
		expect(regexRestriction).not.undefined;
		const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
		expect(requiredRestriction).not.undefined;
		const codeListRestriction = restrictions.find((restriction) => restriction.type === 'codeList');
		expect(codeListRestriction).not.undefined;
	});
	it('Returns array with rules from all objects in restrictions array', () => {
		const restrictions = resolveFieldRestrictions(undefined, {}, fieldStringArrayMultipleRegex);
		expect(restrictions.length).equal(2);
		expect(restrictions.every((restriction) => restriction.type === 'regex')).true;
	});
	describe('Conditional Restrictions', () => {
		it('Returns `then` restrictions when condition is true', () => {
			const record: DataRecord = {
				[fieldStringNoRestriction.name]: 'has value',
				[fieldStringConditionalExists.name]: 'anything',
			};
			const restrictions = resolveFieldRestrictions(
				record[fieldStringConditionalExists.name],
				record,
				fieldStringConditionalExists,
			);
			expect(restrictions.length).equal(1);
			expect(restrictions[0]?.type).equal('required');
			expect(restrictions[0]?.rule).equal(true);
		});
		it('Returns `else` restrictions when condition is false', () => {
			const record: DataRecord = {
				[fieldStringNoRestriction.name]: undefined,
				[fieldStringConditionalExists.name]: 'anything',
			};
			const restrictions = resolveFieldRestrictions(
				record[fieldStringConditionalExists.name],
				record,
				fieldStringConditionalExists,
			);
			expect(restrictions.length).equal(1);
			expect(restrictions[0]?.type).equal('empty');
			expect(restrictions[0]?.rule).equal(true);
		});
		it('Combines conditional restrictions with other restrictions', () => {
			const record: DataRecord = {
				[fieldNumberNoRestriction.name]: 15,
				[fieldStringRequiredConditionalRange.name]: 'big',
			};
			const restrictions = resolveFieldRestrictions(
				record[fieldStringRequiredConditionalRange.name],
				record,
				fieldStringRequiredConditionalRange,
			);
			expect(restrictions.length).equal(2);

			// one of the restrictions is 'required'
			const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
			expect(requiredRestriction).not.undefined;

			// one of the restrictions is 'codeList'
			const codeListRestriction = restrictions.find((restriction) => restriction.type === 'codeList');
			expect(codeListRestriction).not.undefined;
		});
		it('Does not add any restriction when condition is true and there is no `then`', () => {
			const record: DataRecord = {
				[fieldStringNoRestriction.name]: 'anything',
				[fieldStringConditionalExistsWithouthThenElse.name]: 'anything goes',
			};
			const restrictions = resolveFieldRestrictions(
				record[fieldStringConditionalExistsWithouthThenElse.name],
				record,
				fieldStringConditionalExistsWithouthThenElse,
			);
			expect(restrictions.length).equal(0);
		});
		it('Does not add any restriction when condition fails and there is no `else`', () => {
			const record: DataRecord = {
				[fieldNumberNoRestriction.name]: 0,
				[fieldStringRequiredConditionalRange.name]: 'anything goes',
			};
			const restrictions = resolveFieldRestrictions(
				record[fieldStringRequiredConditionalRange.name],
				record,
				fieldStringRequiredConditionalRange,
			);
			expect(restrictions.length).equal(1);

			// one of the restrictions is 'required'
			const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
			expect(requiredRestriction).not.undefined;

			// no 'codeList' restriction
			const codeListRestriction = restrictions.find((restriction) => restriction.type === 'codeList');
			expect(codeListRestriction).undefined;
		});
		describe('ConditionalRestrictionTest Case', () => {
			// This is the `case` property at the level of the `conditions` array. It specifies how many conditions must match
			// for this test to be true and apply the `then` restrictions. If the restriction resolves to `required` this indicates
			// the `then` object is returned and therefore the condition tested true. The condition fail case returns the `else`
			// with an `empty` restriction. Therefore, `required` is test passes, `empty` is test failed.

			const recordAllFields: DataRecord = {
				[fieldStringNoRestriction.name]: 'asdf',
				[fieldNumberNoRestriction.name]: 1,
				[fieldBooleanNoRestriction.name]: true,
			};
			const recordOneField: DataRecord = {
				[fieldStringNoRestriction.name]: 'asdf',
			};
			const recordNoFields: DataRecord = {};

			it('Default case is `all`', () => {
				expect(ARRAY_TEST_CASE_DEFAULT).equal('all');

				// also repeating the case=`all` test with no case value specified, makes sure this default is being applied
				const restrictionsAllFields = resolveFieldRestrictions(
					'irrelevant',
					recordAllFields,
					fieldStringConditionalMultipleConditions,
				);
				const restrictionsOneField = resolveFieldRestrictions(
					'irrelevant',
					recordOneField,
					fieldStringConditionalMultipleConditions,
				);
				const restrictionsNoFields = resolveFieldRestrictions(
					'irrelevant',
					recordNoFields,
					fieldStringConditionalMultipleConditions,
				);

				expect(restrictionsAllFields[0]?.type).equal('required'); // test passed
				expect(restrictionsOneField[0]?.type).equal('empty'); // test failed
				expect(restrictionsNoFields[0]?.type).equal('empty'); // test failed
			});
			it('Case `all` requires every condition to be true', () => {
				const fieldCaseAll = cloneDeep(fieldStringConditionalMultipleConditions);
				assert(
					typeof fieldCaseAll.restrictions === 'object' &&
						'if' in fieldCaseAll.restrictions &&
						fieldCaseAll.restrictions?.if,
				);
				fieldCaseAll.restrictions.if.case = 'all';

				const restrictionsAllFields = resolveFieldRestrictions('irrelevant', recordAllFields, fieldCaseAll);
				const restrictionsOneField = resolveFieldRestrictions('irrelevant', recordOneField, fieldCaseAll);
				const restrictionsNoFields = resolveFieldRestrictions('irrelevant', recordNoFields, fieldCaseAll);

				expect(restrictionsAllFields[0]?.type).equal('required');
				expect(restrictionsOneField[0]?.type).equal('empty');
				expect(restrictionsNoFields[0]?.type).equal('empty');
			});
			it('Case `any` requires at least one condition to be true', () => {
				const fieldCaseAny = cloneDeep(fieldStringConditionalMultipleConditions);
				assert(
					typeof fieldCaseAny.restrictions === 'object' &&
						'if' in fieldCaseAny.restrictions &&
						fieldCaseAny.restrictions?.if,
				);
				fieldCaseAny.restrictions.if.case = 'any';

				const restrictionsAllFields = resolveFieldRestrictions('irrelevant', recordAllFields, fieldCaseAny);
				const restrictionsOneField = resolveFieldRestrictions('irrelevant', recordOneField, fieldCaseAny);
				const restrictionsNoFields = resolveFieldRestrictions('irrelevant', recordNoFields, fieldCaseAny);

				expect(restrictionsAllFields[0]?.type).equal('required'); // test resolves true
				expect(restrictionsOneField[0]?.type).equal('required'); // test resolves true due to at least one field present
				expect(restrictionsNoFields[0]?.type).equal('empty');
			});
			it('Case `none` requires all conditions to be false', () => {
				const fieldCaseNone = cloneDeep(fieldStringConditionalMultipleConditions);
				assert(
					typeof fieldCaseNone.restrictions === 'object' &&
						'if' in fieldCaseNone.restrictions &&
						fieldCaseNone.restrictions?.if,
				);
				fieldCaseNone.restrictions.if.case = 'none';

				const restrictionsAllFields = resolveFieldRestrictions('irrelevant', recordAllFields, fieldCaseNone);
				const restrictionsOneField = resolveFieldRestrictions('irrelevant', recordOneField, fieldCaseNone);
				const restrictionsNoFields = resolveFieldRestrictions('irrelevant', recordNoFields, fieldCaseNone);

				expect(restrictionsAllFields[0]?.type).equal('empty'); // test resolves false
				expect(restrictionsOneField[0]?.type).equal('empty'); // test resolves false
				expect(restrictionsNoFields[0]?.type).equal('required'); // test resolves true
			});
		});

		describe('RestrictionCondition Case', () => {
			/*
			The case property inside a condition indicates how many of the fields must pass the match test in order
			for the condition to be true.

			The field to test this lists three string fields in the `fields` property and will match each of them with
			the alpha-only regex.

			When the condition passes, the restrictions will resolve with `required`, and when it fails it will resolve
			to `empty`.
			*/
			const recordAllMatch: DataRecord = {
				first: 'asdf',
				second: 'qwerty',
				third: 'hello',
			};
			const recordOneMatch: DataRecord = {
				first: undefined,
				second: 'qwerty', // matches alpha-only req
				third: '1234',
			};
			const recordNoMatches: DataRecord = {
				first: undefined,
				second: 'hello! world!', //symbols and whitespace don't match
				third: '1234',
			};

			it('Default case is `all`', () => {
				const restrictionsAllMatch = resolveFieldRestrictions(
					'irrelevant',
					recordAllMatch,
					fieldStringConditionalMultipleFieldsRegex,
				);
				const restrictionsOneMatch = resolveFieldRestrictions(
					'irrelevant',
					recordOneMatch,
					fieldStringConditionalMultipleFieldsRegex,
				);
				const restrictionsNoMatches = resolveFieldRestrictions(
					'irrelevant',
					recordNoMatches,
					fieldStringConditionalMultipleFieldsRegex,
				);

				expect(restrictionsAllMatch[0]?.type).equal('required'); // test passed
				expect(restrictionsOneMatch[0]?.type).equal('empty'); // test failed
				expect(restrictionsNoMatches[0]?.type).equal('empty'); // test failed
			});
			it('Case `all` requires every field to match', () => {
				const fieldCaseAll = cloneDeep(fieldStringConditionalMultipleFieldsRegex);
				assert(
					typeof fieldCaseAll.restrictions === 'object' &&
						'if' in fieldCaseAll.restrictions &&
						fieldCaseAll.restrictions?.if &&
						fieldCaseAll.restrictions.if.conditions[0],
				);
				fieldCaseAll.restrictions.if.conditions[0].case = 'all';

				const restrictionsAllMatch = resolveFieldRestrictions('irrelevant', recordAllMatch, fieldCaseAll);
				const restrictionsOneMatch = resolveFieldRestrictions('irrelevant', recordOneMatch, fieldCaseAll);
				const restrictionsNoMatches = resolveFieldRestrictions('irrelevant', recordNoMatches, fieldCaseAll);

				expect(restrictionsAllMatch[0]?.type).equal('required'); // test passed
				expect(restrictionsOneMatch[0]?.type).equal('empty'); // test failed
				expect(restrictionsNoMatches[0]?.type).equal('empty'); // test failed
			});

			it('Case `any` requires at lest one field to match', () => {
				const fieldCaseAny = cloneDeep(fieldStringConditionalMultipleFieldsRegex);
				assert(
					typeof fieldCaseAny.restrictions === 'object' &&
						'if' in fieldCaseAny.restrictions &&
						fieldCaseAny.restrictions?.if &&
						fieldCaseAny.restrictions.if.conditions[0],
				);
				fieldCaseAny.restrictions.if.conditions[0].case = 'any';

				const restrictionsAllMatch = resolveFieldRestrictions('irrelevant', recordAllMatch, fieldCaseAny);
				const restrictionsOneMatch = resolveFieldRestrictions('irrelevant', recordOneMatch, fieldCaseAny);
				const restrictionsNoMatches = resolveFieldRestrictions('irrelevant', recordNoMatches, fieldCaseAny);

				expect(restrictionsAllMatch[0]?.type).equal('required'); // test passed
				expect(restrictionsOneMatch[0]?.type).equal('required'); // test passed
				expect(restrictionsNoMatches[0]?.type).equal('empty'); // test failed
			});

			it('Case `none` requires at lest one field to match', () => {
				const fieldCaseNone = cloneDeep(fieldStringConditionalMultipleFieldsRegex);
				assert(
					typeof fieldCaseNone.restrictions === 'object' &&
						'if' in fieldCaseNone.restrictions &&
						fieldCaseNone.restrictions?.if &&
						fieldCaseNone.restrictions.if.conditions[0],
				);
				fieldCaseNone.restrictions.if.conditions[0].case = 'none';

				const restrictionsAllMatch = resolveFieldRestrictions('irrelevant', recordAllMatch, fieldCaseNone);
				const restrictionsOneMatch = resolveFieldRestrictions('irrelevant', recordOneMatch, fieldCaseNone);
				const restrictionsNoMatches = resolveFieldRestrictions('irrelevant', recordNoMatches, fieldCaseNone);

				expect(restrictionsAllMatch[0]?.type).equal('empty'); // test passed
				expect(restrictionsOneMatch[0]?.type).equal('empty'); // test passed
				expect(restrictionsNoMatches[0]?.type).equal('required'); // test failed
			});
		});
		describe('Nested Conditions', () => {
			/*
			The field we are testing with has 3 conditions we can test, structured like:
			if(A - `any-string` has repeated text):
				then:
					if(B - `any-number` is 0 or greater):
						then: regex
					if(C - `any-boolean` === `true`):
						then: required
				else: empty

			to test this, we want to try the following cases:
			case 1 - A false. only restriction is empty
			case 2 - A true, B and C false. No restrictions.
			case 3 - A true, B and C true. regex and required restrictions.
			case 4 - A true, B true, and C false. only regex required.
			case 5 - A true, B false, and C true. only required restriction.
			*/
			it('Case 1 - Root condition false, only root else restrictions returned', () => {
				const record: DataRecord = {
					[fieldStringNoRestriction.name]: 'asdf',
					[fieldNumberNoRestriction.name]: 1,
					[fieldBooleanNoRestriction.name]: true,
				};
				const restrictions = resolveFieldRestrictions('irrelevant', record, fieldStringNestedConditional);
				expect(restrictions.length).equal(1);
				expect(restrictions[0]?.type).equal('empty');
			});
			it('Case 2 - Root condition true, other conditions false, resolves with no restrictions', () => {
				const record: DataRecord = {
					[fieldStringNoRestriction.name]: 'repeated repeated',
					[fieldNumberNoRestriction.name]: -1,
					[fieldBooleanNoRestriction.name]: false,
				};
				const restrictions = resolveFieldRestrictions('irrelevant', record, fieldStringNestedConditional);
				expect(restrictions.length).equal(0);
			});

			it('Case 3 - All conditions true, all then restrictions resolved', () => {
				const record: DataRecord = {
					[fieldStringNoRestriction.name]: 'repeated repeated',
					[fieldNumberNoRestriction.name]: 1,
					[fieldBooleanNoRestriction.name]: true,
				};
				const restrictions = resolveFieldRestrictions('irrelevant', record, fieldStringNestedConditional);
				expect(restrictions.length).equal(2);

				// one of the restrictions is 'required'
				const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
				expect(requiredRestriction).not.undefined;
				expect(requiredRestriction?.rule).equal(true);

				// one of the restrictions is 'regex'
				const regexRestriction = restrictions.find((restriction) => restriction.type === 'regex');
				expect(regexRestriction).not.undefined;
				expect(regexRestriction?.rule).equal(regexAlphaOnly);
			});
			it('Case 4 - Root condition true, number condition true and boolean condition false, returns regex restriction', () => {
				const record: DataRecord = {
					[fieldStringNoRestriction.name]: 'repeated repeated',
					[fieldNumberNoRestriction.name]: 1,
					[fieldBooleanNoRestriction.name]: false,
				};
				const restrictions = resolveFieldRestrictions('irrelevant', record, fieldStringNestedConditional);
				expect(restrictions.length).equal(1);

				// one of the restrictions is 'required'
				const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
				expect(requiredRestriction).undefined;

				// one of the restrictions is 'regex'
				const regexRestriction = restrictions.find((restriction) => restriction.type === 'regex');
				expect(regexRestriction).not.undefined;
				expect(regexRestriction?.rule).equal(regexAlphaOnly);
			});
			it('Case 5 - Root condition true, number condition true and boolean condition false, returns regex restriction', () => {
				const record: DataRecord = {
					[fieldStringNoRestriction.name]: 'repeated repeated',
					[fieldNumberNoRestriction.name]: -1,
					[fieldBooleanNoRestriction.name]: true,
				};
				const restrictions = resolveFieldRestrictions('irrelevant', record, fieldStringNestedConditional);
				expect(restrictions.length).equal(1);

				// one of the restrictions is 'required'
				const requiredRestriction = restrictions.find((restriction) => restriction.type === 'required');
				expect(requiredRestriction).not.undefined;
				expect(requiredRestriction?.rule).equal(true);

				// one of the restrictions is 'regex'
				const regexRestriction = restrictions.find((restriction) => restriction.type === 'regex');
				expect(regexRestriction).undefined;
			});
		});
	});
});

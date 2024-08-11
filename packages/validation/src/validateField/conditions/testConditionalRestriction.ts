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

import {
	ARRAY_TEST_CASE_DEFAULT,
	ArrayTestCase,
	type ArrayDataValue,
	type ConditionalRestrictionTest,
	type DataRecord,
	type DataRecordValue,
	type RestrictionCondition,
	type SingleDataValue,
} from '@overture-stack/lectern-dictionary';
import { resultForArrayTestCase } from '../../utils/resultForArrayTestCase';
import { testMatchCount } from './testMatchCount';
import { testMatchCodeList } from './testMatchCodeList';
import { testMatchExists } from './testMatchExists';
import { testMatchRange } from './testMatchRange';
import { testMatchRegex } from './testMatchRegex';
import { testMatchValue } from './testMatchValue';

/**
 * Test values extracted from other fields vs a match test. This function should be passed the
 *
 * @param values
 * @param rule
 * @param matchTest
 * @param arrayCase  Intentionally using `| undefined` vs `/?: arrayCase` to ensure that this argument is provided when this function is called
 * @returns
 */
const fieldsPassMatchTest = (
	values: DataRecordValue[],
	matchTest: (value: DataRecordValue) => boolean,
	arrayCase: ArrayTestCase | undefined,
): boolean => {
	const fieldTestResults = values.map((value) => matchTest(value));
	return resultForArrayTestCase(fieldTestResults, arrayCase || ARRAY_TEST_CASE_DEFAULT);
};

const testConditionForSingularValue = (
	condition: RestrictionCondition,
	_value: SingleDataValue,
	fieldValues: DataRecordValue[],
): boolean => {
	const matchCodeList = condition.match.codeList;
	if (matchCodeList !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchCodeList(matchCodeList, value), condition.case)) {
			return false;
		}
	}
	const matchCount = condition.match.count;
	if (matchCount !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchCount(matchCount, value), condition.case)) {
			return false;
		}
	}

	const matchExists = condition.match.exists;
	if (matchExists !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchExists(matchExists, value), condition.case)) {
			return false;
		}
	}

	const matchRange = condition.match.range;
	if (matchRange !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchRange(matchRange, value), condition.case)) {
			return false;
		}
	}

	const matchRegex = condition.match.regex;
	if (matchRegex !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchRegex(matchRegex, value), condition.case)) {
			return false;
		}
	}

	const matchValue = condition.match.value;
	if (matchValue !== undefined) {
		if (!fieldsPassMatchTest(fieldValues, (value) => testMatchValue(matchValue, value), condition.case)) {
			return false;
		}
	}
	return true;
};

const testConditionForArray = (
	_condition: RestrictionCondition,
	_value: ArrayDataValue,
	_fieldValues: DataRecordValue[],
): boolean => {
	throw new Error('Unimplemented.');
};

const testCondition = (condition: RestrictionCondition, value: DataRecordValue, record: DataRecord): boolean => {
	const recordValues = condition.fields.map((fieldName) => record[fieldName]);
	return Array.isArray(value)
		? testConditionForArray(condition, value, recordValues)
		: testConditionForSingularValue(condition, value, recordValues);
};

/**
 * Check all conditions inside the `if` object of a Conditiohnal Restriction to determine if the condition is met for
 * a given field and its data record. This will apply all match rules inside each condition versus a field value and data record.
 */
export const testConditionalRestriction = (
	conditionalTest: ConditionalRestrictionTest,
	value: DataRecordValue,
	record: DataRecord,
): boolean => {
	const results = conditionalTest.conditions.map((condition) => testCondition(condition, value, record));
	return resultForArrayTestCase(results, conditionalTest.case || ARRAY_TEST_CASE_DEFAULT);
};

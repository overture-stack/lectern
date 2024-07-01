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

import type { DataRecord, DataRecordValue, SchemaField } from 'dictionary';
import { invalid, valid, type TestResult } from '../types';
import { isValidValueType } from '../utils/isValidValueType';
import type { FieldRestrictionRule } from './FieldRestrictionRule';
import type {
	FieldValidationError,
	FieldValidationErrorRestrictionInfo,
	FieldValidationErrorValueType,
} from './FieldValidationError';
import { testCodeList } from './restrictions/testCodeList';
import { testRange } from './restrictions/testRange';
import { testRegex } from './restrictions/testRegex';
import { testRequired } from './restrictions/testRequired';

const testRestriction = (value: DataRecordValue, restriction: FieldRestrictionRule) => {
	switch (restriction.type) {
		case 'codeList': {
			return testCodeList(restriction.rule, value);
		}
		case 'range': {
			return testRange(restriction.rule, value);
		}
		case 'regex': {
			return testRegex(restriction.rule, value);
		}
		case 'required': {
			return testRequired(restriction.rule, value);
		}
		// case 'unique': {
		// 	return testRequired(restriction.rule, value);
		// }
		// case 'script': {
		// 	return valid();
		// }
	}
};

/**
 * Apply a list of field restriction tests to a data record value.
 *
 * Note: It is possible to provide a value that is a type a restriction cannot process. As an example,
 * a string could be provided along with a range restriction. When these mismatches occur the restriction
 * will not be checked and the test will return as valid. Validating that the value provided matches the
 * schema defined value type should be performed seperately.
 * @param value
 * @param restrictions
 */
const applyFieldRestrictionTests = (
	value: DataRecordValue,
	restrictions: FieldRestrictionRule[],
): FieldValidationErrorRestrictionInfo[] => {
	const errors = restrictions.reduce<FieldValidationErrorRestrictionInfo[]>((output, restriction) => {
		const result = testRestriction(value, restriction);
		if (!result.valid) {
			output.push({
				restriction,
				...result.info,
			});
		}
		return output;
	}, []);

	return errors;
};

/**
 * Convert the restrictions found in a SchemaField definition into a list of rules that apply for this specific value
 * and DataRecord.
 */
export const resolveFieldRestrictions = (
	_value: DataRecordValue,
	_record: DataRecord,
	field: SchemaField,
): FieldRestrictionRule[] => {
	// TODO: This function requires value and record parameters so that conditional restrictions can be resolved.
	// The original implementation with a static set of available restrictions does not need these parameters.
	if (!field.restrictions) {
		return [];
	}

	switch (field.valueType) {
		case 'boolean': {
			const output: FieldRestrictionRule[] = [];
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			// if (field.restrictions.script) {
			// 	output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			// }
			return output;
		}
		case 'integer': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.range) {
				output.push({ type: 'range', rule: field.restrictions.range });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			// if (field.restrictions.script) {
			// 	output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			// }
			return output;
		}
		case 'number': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.range) {
				output.push({ type: 'range', rule: field.restrictions.range });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			// if (field.restrictions.script) {
			// 	output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			// }
			return output;
		}
		case 'string': {
			const output: FieldRestrictionRule[] = [];
			if (Array.isArray(field.restrictions.codeList)) {
				output.push({ type: 'codeList', rule: field.restrictions.codeList });
			}
			if (field.restrictions.regex) {
				output.push({ type: 'regex', rule: field.restrictions.regex });
			}
			if (field.restrictions.required) {
				output.push({ type: 'required', rule: field.restrictions.required });
			}
			// if (field.restrictions.script) {
			// 	output.push({ type: 'script', rule: asArray(field.restrictions.script) });
			// }
			return output;
		}
	}
};

const invalidByType = (fieldDefinition: SchemaField): TestResult<FieldValidationErrorValueType> =>
	invalid({
		reason: 'INVALID_VALUE_TYPE',
		valueType: fieldDefinition.valueType,
		isArray: !!fieldDefinition.isArray,
	});

/**
 * Confirm that a value is valid for a field definition.
 *
 * This validation expects type accurate values, not raw string inputs.
 * @param value
 * @param record
 * @param fieldDefinition
 * @returns
 */
export const validateField = (
	value: DataRecordValue,
	record: DataRecord,
	fieldDefinition: SchemaField,
): TestResult<FieldValidationError> => {
	// Awkward nested if - this makes it slightly easier to reason with and comment.
	// If we have a value, we want to make sure it is the correct type, otherwise we are just going to return as invalid immediately.
	if (value !== undefined) {
		// We now know the value is defined, so we will confirm that the value is the correct type based on the field definition
		if (!isValidValueType(value, fieldDefinition)) {
			// The value is the wrong type! return invalid immediately!
			return invalidByType(fieldDefinition);
		}
	}

	// We have the correct value type, lets get our list of restrictions

	// First we transform restrictions into a list of FieldRestrictionRules, then we apply each of these rules
	const restrictions = resolveFieldRestrictions(value, record, fieldDefinition);

	// Check the restrictions for any required restrictions and apply those.
	// const requiredRestrictions = restrictions.filter(
	// 	(restriction): restriction is FieldRestrictionRuleRequired => restriction.type === 'required',
	// );
	// const requiredTestResults = requiredRestrictions.map((restriction) => testRequired(restriction.rule, value));
	// if (requiredTestResults.length) {
	// 	return invalid({
	// 		reason: 'VALUE_IS_REQUIRED',
	// 	});
	// }

	// if (value === undefined || (fieldDefinition.isArray && Array.isArray(value) && value.length === 0)) {
	// 	// no value and that is OK because no required restriction
	// 	valid();
	// }

	const errors = applyFieldRestrictionTests(value, restrictions);

	if (errors.length) {
		return invalid({ reason: 'INVALID_BY_RESTRICTION', errors });
	}

	return valid();
};

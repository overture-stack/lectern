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

import { type ArrayDataValue } from 'dictionary';
import { invalid, valid, type RestrictionTestResult } from '../types/restrictionTestResult';
import type { FieldRestrictionSingleValueTest, FieldRestrictionTest } from './FieldRestrictionTest';
import { createFieldRestrictionTestForArrays } from './createFieldRestrictionTestForArrays';

const testRequiredSingleValue: FieldRestrictionSingleValueTest<boolean> = (rule, value) => {
	if (rule === false) {
		return valid();
	}
	if (value === undefined) {
		return invalid(`A value is required for this field`);
	}

	return valid();
};

/**
 * This function is the common pattern for applying a fieldRestriction value test to an array.
 * For the required restriction, we wanted to perform a couple additional checks to modify how
 * this works, so this is used inside testRequiredArray after those additional checks are complete.
 */
const internalTestRequiredArray = createFieldRestrictionTestForArrays(
	testRequiredSingleValue,
	`This field requires all items to have a defined value.`,
);

/**
 * Test for required value on an array field. Before using the common pattern of applying the value test to
 * each item in the array, we first check:
 * - if the rule is `false` then the value is always valid
 * - if the length of the array is 0 then the value is invalid
 * @param rule
 * @param values
 * @returns
 */
const testRequiredArray = (rule: boolean, values: ArrayDataValue): RestrictionTestResult => {
	// Note: This doesn't apply the
	if (rule === false) {
		return valid();
	}
	if (values.length === 0) {
		return { ...invalid('A value is required for this field.') };
	}
	return internalTestRequiredArray(rule, values);
};

export const testRequired: FieldRestrictionTest<boolean> = (rule, value) =>
	Array.isArray(value) ? testRequiredArray(rule, value) : testRequiredSingleValue(rule, value);

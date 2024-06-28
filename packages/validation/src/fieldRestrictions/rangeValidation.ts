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

import { RestrictionRange, type SingleDataValue } from 'dictionary';
import { invalid, valid, type RestrictionTestResult } from '../types/restrictionTestResult';
import { isWithinRange } from '../utils/isWithinRange';
import { rangeToText } from '../utils/rangeToText';
import { createFieldRestrictionTestForArrays } from './createFieldRestrictionTestForArrays';
import type { FieldRestrictionSingleValueTest, FieldRestrictionTest } from './FieldRestrictionTest';

const testRangeSingleValue: FieldRestrictionSingleValueTest<RestrictionRange> = (rule, value) => {
	if (typeof value !== 'number') {
		// only apply range tests to numbers
		return valid();
	}

	if (isWithinRange(rule, value)) {
		return valid();
	}
	return invalid(`The value must be within the range: ${rangeToText(rule)}`);
};

const testRangeArray = createFieldRestrictionTestForArrays(
	testRangeSingleValue,
	(rule) => `All values in the array must be within the range: ${rangeToText(rule)}`,
);

export const testRange: FieldRestrictionTest<RestrictionRange> = (rule, value) =>
	Array.isArray(value) ? testRangeArray(rule, value) : testRangeSingleValue(rule, value);

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

import { type DataRecordValue, type MatchRuleValue, type SingleDataValue } from '@overture-stack/lectern-dictionary';
import { isStringArray } from '@overture-stack/lectern-dictionary/dist/utils/typeUtils';
import { testRegex } from '../restrictions';

const normalizeValue = (value: SingleDataValue): SingleDataValue => {
	if (typeof value === 'string') {
		return value.trim().toLowerCase();
	}
	return value;
};

/**
 * Tests if the value has the same value as the value match rule. No type coercion is performed, strings
 * values only match strings, and arrays only match arrays.
 *
 * Strings are matched case insensitive and after trimming and forcing each string to lowercase.
 * @param valueRule
 * @param value
 * @returns
 */
export const testMatchValue = (valueRule: MatchRuleValue, value: DataRecordValue): boolean => {
	if (Array.isArray(valueRule)) {
		if (!Array.isArray(value)) {
			return false;
		}

		if (value.length !== valueRule.length) {
			return false;
		}

		const sortedValue = [...value].map(normalizeValue).sort();
		const sortedRule = [...valueRule].map(normalizeValue).sort();

		const allMatch = sortedRule.every((item, index) => item === sortedValue[index]);

		return allMatch;
	}

	if (Array.isArray(value)) {
		return false;
	}

	return normalizeValue(value) === normalizeValue(valueRule);
};

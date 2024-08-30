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

import { TypeUtils, type RestrictionRegex } from '@overture-stack/lectern-dictionary';
import { invalid, valid } from '../../types/testResult';
import type { FieldRestrictionSingleValueTestFunction, FieldRestrictionTestFunction } from '../FieldRestrictionTest';
import { createFieldRestrictionTestForArrays } from './createFieldRestrictionTestForArrays';

/**
 * regex tests are only performed on strings. All other values will be true.
 * @param rule
 * @param value
 * @returns
 */
const testRegexSingleValue: FieldRestrictionSingleValueTestFunction<RestrictionRegex> = (rule, value) => {
	// Regex tests are only applied to strings
	if (typeof value !== 'string') {
		return valid();
	}

	const regexResult = TypeUtils.asArray(rule).every((regexRule) => {
		const regexPattern = new RegExp(regexRule);

		if (!regexPattern.test(value)) {
			return false;
		}
		return true;
	});
	return regexResult ? valid() : invalid({ message: `The value must match the regular expression.` });
	// TODO: update message to communicate which regex failed (if array)
};

const testRegexArray = createFieldRestrictionTestForArrays(
	testRegexSingleValue,
	(_rule) => `All values in the array must match the regular expression.`,
);

// TODO: The error messages returned here don't inform which regular expressions failed, if there is a list.
//       ...The message doesnt even acknowledge that there could be a list

export const testRegex: FieldRestrictionTestFunction<RestrictionRegex> = (rule, value) =>
	Array.isArray(value) ? testRegexArray(rule, value) : testRegexSingleValue(rule, value);

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

import type { RestrictionCodeList } from '@overture-stack/lectern-dictionary';
import { invalid, valid } from '../../types/testResult';
import type { FieldRestrictionSingleValueTestFunction, FieldRestrictionTestFunction } from '../FieldRestrictionTest';
import { createFieldRestrictionTestForArrays } from './createFieldRestrictionTestForArrays';

const testCodeListSingleValue: FieldRestrictionSingleValueTestFunction<RestrictionCodeList> = (rule, value) => {
	// TODO: this can be sped up by using a set for the rule instead of an array. finding an element in the set is faster.
	if (!(typeof value === 'string' || typeof value === 'number')) {
		// only apply code list check to strings and numbers
		return valid();
	}

	// We want to compare strings after removing whitespace and converting both the option and the value to lowercase
	const testValue = typeof value === 'string' ? value.trim().toLowerCase() : value;

	for (const option of rule) {
		const testOption = typeof option === 'string' ? option.trim().toLowerCase() : option;
		if (testOption === testValue) {
			return valid();
		}
	}
	return invalid({ message: `The value for this field must match an option from the list.` });
};

const testCodeListArray = createFieldRestrictionTestForArrays(
	testCodeListSingleValue,
	`All values in this field must match an option from the list.`,
);

export const testCodeList: FieldRestrictionTestFunction<RestrictionCodeList> = (rule, value) =>
	Array.isArray(value) ? testCodeListArray(rule, value) : testCodeListSingleValue(rule, value);

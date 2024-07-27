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

import { isDefined } from 'common';
import { invalid, valid } from '../../types';
import type {
	FieldRestrictionArrayTestFunction,
	FieldRestrictionSingleValueTestFunction,
} from '../FieldRestrictionTest';

/**
 * Given a function that will apply a fieldRestriction validation test to a single value, this function will
 * create a new function that will apply that test to every element of an array. The new function returns an
 * object that includes a list of invalid items and which position they hold in the array.
 * @param test
 * @param errorMessage Message to display when there are one or more invalid items in the array.
 * This can be a string, or a function generates a message from the details of the specific FieldRestrictionRule.
 * @returns
 */
export const createFieldRestrictionTestForArrays =
	<Rule>(
		test: FieldRestrictionSingleValueTestFunction<Rule>,
		errorMessage: string | ((rule: Rule) => string),
	): FieldRestrictionArrayTestFunction<Rule> =>
	(rule, values) => {
		const invalidItems = values
			.map((value, position) => (test(rule, value).valid ? undefined : { position, value }))
			.filter(isDefined);

		if (invalidItems.length) {
			const message = typeof errorMessage === 'function' ? errorMessage(rule) : errorMessage;
			return invalid({ message, invalidItems });
		}
		return valid();
	};

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

import type { SchemaField } from 'dictionary';

/**
 * Given a string value, look for any matching values in code list restrictions and return that
 * value. This is used by the convertValue functions to ensure the value returned matches the letter
 * cases of the corresponding value in the code list.
 *
 * @example
 * // Given a field `fieldWithCodeList` that has a code list restriction `["Apple", "Banana"]`
 * const originalValue = 'banana';
 * const matchingValue = matchCodeListFormatting(originalValue, fieldWithCodeList);
 *
 * // matchingValue will equal `Banana`;
 *
 * @param value
 * @param fieldDefinition
 * @returns
 */
export function matchCodeListFormatting(value: string, fieldDefinition: SchemaField): string {
	const { valueType, restrictions } = fieldDefinition;

	if (valueType === 'string') {
		const codeList = restrictions?.codeList;
		if (Array.isArray(codeList)) {
			// We have found a code list to compare to!

			// prepare the value for comparison by making it lower case
			const candidate = value.toLowerCase();

			// look for a match
			const match = codeList.find((option) => option.trim().toLowerCase() === candidate);

			if (match !== undefined) {
				// we have a match! return it!
				return match;
			}
		}
	}

	// no match was found, return original value
	return value;
}

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

import type { DataRecordValue, MatchRuleCodeList } from '@overture-stack/lectern-dictionary';
import { isNumberArray, isStringArray } from '@overture-stack/lectern-dictionary/dist/utils/typeUtils';

/**
 * Check if the value (or at least one value from an array) is found in the code list.
 */
export const testMatchCodeList = (codeList: MatchRuleCodeList, value: DataRecordValue): boolean => {
	if (isStringArray(codeList)) {
		if (isStringArray(value)) {
			// If we can find at least one match from our codeList inside the array of values then we return true
			return value.some((singleValue) => codeList.includes(singleValue));
		}
		if (typeof value === 'string') {
			return codeList.includes(value);
		}
	}
	if (isNumberArray(codeList)) {
		if (isNumberArray(value)) {
			return value.some((singleValue) => codeList.includes(singleValue));
		}
		if (typeof value === 'number') {
			return codeList.includes(value);
		}
	}

	// If the code reaches here, we have a mismatch between the type of the codeList and the value, for example
	// the code list is an array of strings but the value is a number. Since these mismatched types will never match
	// we return false.
	return false;
};

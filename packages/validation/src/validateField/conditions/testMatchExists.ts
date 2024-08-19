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
	TypeUtils,
	type DataRecordValue,
	type MatchRuleExists,
	type SingleDataValue,
} from '@overture-stack/lectern-dictionary';

const valueExists = (value: SingleDataValue) => {
	if (value === undefined) {
		return false;
	}
	switch (typeof value) {
		case 'string': {
			// empty string, and all whitespace, are treated as empty values
			return value.trim() !== '';
		}
		case 'number': {
			// Treate NaN and Infinity values as missing values
			return Number.isFinite(value);
		}
		case 'boolean': {
			return true;
		}
	}
};

/**
 * Test if the value exists, ie. that it is not undefined or an empty array. When the rule is true, this will
 * return true when the value exists, and when the rule is false this will return true only when the value does
 * not exist.
 *
 * Notes:
 *   - Boolean value `false` is an existing value
 *   - Empty strings represent a missing value, so empty string value is not teated as an existing value
 */
export const testMatchExists = (exists: MatchRuleExists, value: DataRecordValue): boolean => {
	const isEmptyArray = Array.isArray(value) && value.length === 0;
	const isValueExists = !isEmptyArray && TypeUtils.asArray(value).every(valueExists);

	return exists === isValueExists;
};

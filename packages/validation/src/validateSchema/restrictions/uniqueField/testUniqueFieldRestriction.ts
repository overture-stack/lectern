/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
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

import type { DataRecordValue } from '@overture-stack/lectern-dictionary';
import { invalid, valid, type TestResult } from '../../../types';
import { hashDataRecord } from '../../../utils/hashDataRecord';
import type { SchemaValidationRecordErrorUnique } from '../../SchemaValidationError';

/**
 * Check if this record has a unique value for the given field.
 *
 * This requires a `uniqueKeyMap` to be provided - such a map can be generated using `generateDataSetHashMap(records, [fieldName])`.
 * @param record
 * @param uniqueKeyRule
 * @param uniqueKeyMap
 * @returns
 */
export const testUniqueFieldRestriction = (
	fieldValue: DataRecordValue,
	fieldName: string,
	uniqueKeyMap: Map<string, number[]>,
): TestResult<SchemaValidationRecordErrorUnique> => {
	// Only apply unique field restriction when a value is provided
	if (fieldValue === undefined || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
		return valid();
	}
	// Build unique key for this record, based on the fields listed in the rule
	const hash = hashDataRecord({ [fieldName]: fieldValue });

	// Lookup the key in the provided map. Report errors when the map has more than one record index found for this hash
	const matchingRecords = uniqueKeyMap.get(hash);
	if (matchingRecords && matchingRecords.length > 1) {
		return invalid({
			reason: 'INVALID_BY_UNIQUE',
			fieldName,
			fieldValue,
			matchingRecords,
		});
	}
	return valid();
};

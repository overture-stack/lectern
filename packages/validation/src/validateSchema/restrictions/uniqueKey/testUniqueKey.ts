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

import type { DataRecord, Schema, SchemaField } from 'dictionary';
import type { SchemaValidationRecordErrorUniqueKey } from '../../SchemaValidationError';
import { invalid, valid, type TestResult } from '../../../types';
import { hashDataRecord } from '../../../utils/hashDataRecord';
import { getUniqueKeyValues } from './getUniqueKeyValues';

/**
 * Check if this record is unique in a data set based on the fields defined in the Schema's uniqueKey restriction.
 *
 * A uniqueKey restriction is like a compound primary-key constraint. It is defined by a list of fieldNames. For
 * each record in a data set, we find the uniqueKey value for each record by combining the record's values for the
 * fields listed in the uniqueKey restriction and generate a hash based on these fields and values. Each record in the
 * data set must have a unique value for this uniqueKey hash.
 *
 * To perform this check, the function needs to be provided a map object where the keys are the uniqueKey hash strings,
 * and the values are arrays of numbers where each number represents the indicies of records in the data set with that
 * uniqueKey hash. If there are no uniqueKey errors, then every entry in this map will have exactly one item in it.
 *
 * This function returns a SchemaValidationRecordErrorUniqueKey which is the SchemaValidationRecordError with information
 * about the uniqueKey error.
 * @param record
 * @param uniqueKeyRule
 * @param uniqueKeyMap
 * @returns
 */
export const testUniqueKey = (
	record: DataRecord,
	uniqueKeyRule: string[],
	uniqueKeyMap: Map<string, number[]>,
): TestResult<SchemaValidationRecordErrorUniqueKey> => {
	// Build unique key for this record, based on the fields listed in the rule
	const uniqueKeyValues = getUniqueKeyValues(record, uniqueKeyRule);
	const uniqueKeyHash = hashDataRecord(uniqueKeyValues);

	// Lookup the key in the provided map. We report errors when the map has more than one record index found for this hash
	const matchingRecords = uniqueKeyMap.get(uniqueKeyHash);
	if (matchingRecords && matchingRecords.length > 1) {
		return invalid({
			reason: 'INVALID_BY_UNIQUE_KEY',
			matchingRecords,
			uniqueKey: uniqueKeyValues,
		});
	}
	return valid();
};

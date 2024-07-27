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

import type { DataRecord } from 'dictionary';
import { hashDataRecord } from '../../utils/hashDataRecord';
import { getUniqueKeyValues } from './uniqueKey/getUniqueKeyValues';

/**
 * The key in this Map is a unique hash made of select fields from a record. This is generated using `hashDataRecord()`
 * The value in this Map is an array of numbers, where each number represents the position of a record in a data set (data sets will be `DataRecord[]` with all records from the same schema).
 *
 * This is a named alias over a Map<string, number>;
 */
export type DataSetHashMap = Map<string, number[]>;

/**
 * Provides a DataSetHashMap for a provided data set. For every record in the data set this will generate a string
 * based on the values of specific fields, then an entry will added to the Map using this string as the key, with the
 * value an array of numbers representing the array index position of all records that share the same values for the
 * specified fields.
 *
 * This means that for a data set where each record generates a unique hash, every entry in the Map will be an array
 * with a single number (the index of the record with that hash). When two or more records have the same hash, the
 * Map's value for that hash will be an array with the index of all records with that hash.
 * @param records
 * @param fieldsToHash
 * @returns
 */
export const generateDataSetHashMap = (records: DataRecord[], fieldsToHash: string[]): DataSetHashMap => {
	const output = new Map<string, number[]>();

	records.forEach((record, index) => {
		// generate hash for this record
		const uniqueKeyValues = getUniqueKeyValues(record, fieldsToHash);

		const hash = hashDataRecord(uniqueKeyValues);

		// check if this hash has an existing value, otherwise create a new array
		const indexList = output.get(hash) || [];
		const updatedIndexList = indexList.concat(index);

		output.set(hash, updatedIndexList);
	});

	return output;
};

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

import type { DataRecord } from '@overture-stack/lectern-dictionary';
import { hashDataRecord } from '../../utils/hashDataRecord';
import { getUniqueKeyValues } from './uniqueKey/getUniqueKeyValues';

/**
 * The key in this Map is a unique hash made of select fields from a record, generated using `hashDataRecord()`.
 * The value is an array of string record IDs — all records that share the same values for the hashed fields.
 */
export type DataSetHashMap = Map<string, string[]>;

/**
 * A function that produces a string identifier for a record at a given index. Used to populate
 * `DataSetHashMap` values so that callers can map hash collisions back to specific records.
 *
 * The default when no generator is provided is `String(index)`, which preserves the previous
 * behaviour of using array position as the identifier.
 */
export type RecordIdGenerator = (record: DataRecord, index: number) => string;

const defaultRecordId: RecordIdGenerator = (_record, index) => String(index);

/**
 * Provides a DataSetHashMap for a provided data set. For every record in the data set this will generate a string
 * based on the values of specific fields, then an entry will be added to the Map using this string as the key, with the
 * value an array of string IDs representing all records that share the same values for the specified fields.
 *
 * This means that for a data set where each record generates a unique hash, every entry in the Map will be an array
 * with a single ID. When two or more records have the same hash, the Map's value for that hash will be an array
 * with the IDs of all records with that hash.
 * @param records
 * @param fieldsToHash
 * @param recordId Optional function to derive a string ID for each record. Defaults to the record's array index.
 * @returns
 */
export const generateDataSetHashMap = (
	records: DataRecord[],
	fieldsToHash: string[],
	recordId: RecordIdGenerator = defaultRecordId,
): DataSetHashMap => {
	const output = new Map<string, string[]>();

	records.forEach((record, index) => {
		const uniqueKeyValues = getUniqueKeyValues(record, fieldsToHash);
		const hash = hashDataRecord(uniqueKeyValues);

		const idList = output.get(hash) ?? [];
		output.set(hash, [...idList, recordId(record, index)]);
	});

	return output;
};

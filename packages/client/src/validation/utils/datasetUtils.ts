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

import { DataRecord } from '../../types/dataRecords';

/**
 * Returns a string representation of a record. The record is sorted by its properties so
 * 2 records which have the same properties and values (even if in different order) will produce the
 * same string with this function.
 * @param record Record to be processed.
 * @returns String representation of the record sorted by its properties.
 */
const getSortedRecordKey = (record: DataRecord): string => {
	const sortedKeys = Object.keys(record).sort();
	const sortedRecord: DataRecord = {};
	for (const key of sortedKeys) {
		sortedRecord[key] = record[key];
	}
	return JSON.stringify(sortedRecord);
};

/**
 * Find duplicate keys in a dataset.
 * @param datasetKeys Array with the keys to evaluate.
 * @returns An Array with all the values that appear more than once in the dataset.
 */
export const findDuplicateKeys = (datasetKeys: [number, DataRecord][]): [number, DataRecord][] => {
	const duplicateKeys: [number, DataRecord][] = [];
	const recordKeysMap: Map<[number, DataRecord], string> = new Map();
	const keyCount: Map<string, number> = new Map();

	// Calculate a key per record, which is a string representation that allows to compare records even if their properties
	// are in different order
	datasetKeys.forEach((row) => {
		const recordKey = getSortedRecordKey(row[1]);
		const count = keyCount.get(recordKey) || 0;
		keyCount.set(recordKey, count + 1);
		recordKeysMap.set(row, recordKey);
	});

	// Find duplicates by checking the count of they key on each record
	recordKeysMap.forEach((value, key) => {
		const count = keyCount.get(value) ?? 0;
		if (count > 1) {
			duplicateKeys.push(key);
		}
	});
	return duplicateKeys;
};

/**
 * A "select" function that retrieves specific fields from the dataset as a record, as well as the numeric position of each row in the dataset.
 * @param dataset Dataset to select fields from.
 * @param fields Array with names of the fields to select.
 * @returns An array of tuples tuple where the first element is the index of the row in the dataset, and the second value is the record with the
 * selected values.
 */
export const selectFieldsFromDataset = (dataset: DataRecord[], fields: string[]): [number, DataRecord][] =>
	dataset.map((row, index) => {
		const filteredRecord = fields.reduce<DataRecord>((acc, field) => {
			acc[field] = row[field] || '';
			return acc;
		}, {});
		return [index, filteredRecord];
	});

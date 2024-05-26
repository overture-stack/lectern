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

import { differenceWith, isEqual } from 'lodash';

/**
 * Renames properties in a record using a mapping between current and new names.
 * @param record The record whose properties should be renamed.
 * @param fieldsMapping A mapping of current property names to new property names.
 * @returns A new record with the properties' names changed according to the mapping.
 */
const renameProperties = (
	record: Record<string, string | string[]>,
	fieldsMapping: Map<string, string>,
): Record<string, string | string[]> => {
	const renamed: Record<string, string | string[]> = {};
	Object.entries(record).forEach(([propertyName, propertyValue]) => {
		const newName = fieldsMapping.get(propertyName) ?? propertyName;
		renamed[newName] = propertyValue;
	});
	return renamed;
};

/**
 * Returns a string representation of a record. The record is sorted by its properties so
 * 2 records which have the same properties and values (even if in different order) will produce the
 * same string with this function.
 * @param record Record to be processed.
 * @returns String representation of the record sorted by its properties.
 */
const getSortedRecordKey = (record: Record<string, string | string[]>): string => {
	const sortedKeys = Object.keys(record).sort();
	const sortedRecord: Record<string, string | string[]> = {};
	for (const key of sortedKeys) {
		sortedRecord[key] = record[key];
	}
	return JSON.stringify(sortedRecord);
};

/**
 * Find missing foreign keys by calculating the difference between 2 dataset keys (similar to a set difference).
 * Returns rows in `dataKeysA` which are not present in `dataKeysB`.
 * @param datasetKeysA Keys of the dataset A. The returned value of this function is a subset of this array.
 * @param datasetKeysB Keys of the dataset B. Elements to be substracted from `datasetKeysA`.
 * @param fieldsMapping Mapping of the field names so the keys can be compared correctly.
 */
export const findMissingForeignKeys = (
	datasetKeysA: [number, Record<string, string | string[]>][],
	datasetKeysB: [number, Record<string, string | string[]>][],
	fieldsMapping: Map<string, string>,
): [number, Record<string, string | string[]>][] => {
	const diff = differenceWith(datasetKeysA, datasetKeysB, (a, b) =>
		isEqual(a[1], renameProperties(b[1], fieldsMapping)),
	);
	return diff;
};

/**
 * Find duplicate keys in a dataset.
 * @param datasetKeys Array with the keys to evaluate.
 * @returns An Array with all the values that appear more than once in the dataset.
 */
export const findDuplicateKeys = (
	datasetKeys: [number, Record<string, string | string[]>][],
): [number, Record<string, string | string[]>][] => {
	const duplicateKeys: [number, Record<string, string | string[]>][] = [];
	const recordKeysMap: Map<[number, Record<string, string | string[]>], string> = new Map();
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

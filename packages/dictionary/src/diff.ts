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

import * as _ from 'lodash';
import { Dictionary, SchemaField } from '.';
import {
	ValueChangeTypeNames,
	FieldDiff,
	DictionaryDiff,
	DictionaryDiffArray,
	FieldChanges,
	ValueChangeTypeName,
	ValueChange,
} from './types/diffTypes';

/**
 * This is the core function for calculating a diff between two fields. This loops over all properties of the objects
 * and returns an ValueChange if the value is different (added, removed, or changed from ob1 to obj2). ALl these ValueChange
 * objects are collected into an object with keys equal to the property name.
 *
 * This same method can be passed the SchemaField object, or any of the values in their properties, even the nested
 * properties like restrictions and meta.
 *
 * @param obj1 value starting from
 * @param obj2 value changed to
 * @returns difference between those values
 */
const recursiveDiff = (obj1: any, obj2: any): FieldChanges => {
	if (_.isFunction(obj1) || _.isFunction(obj2)) {
		// This block should never be reached since this module only passes SchemaFields to recursiveDiff (input is never a function).
		// However, the arguments are typed as `any` so this is here for completeness, left from the original
		// implementation before strict types.
		// This comment applies to all checks of isFunction in this function
		throw 'Invalid argument. Function given, object expected.';
	}

	if (isValue(obj1) || isValue(obj2)) {
		//
		return {
			type: compareValues(obj1, obj2),
			data: obj2 === undefined ? obj1 : obj2,
		};
	}

	if (_.isArray(obj1) || _.isArray(obj2)) {
		return {
			type: compareArrays(obj1, obj2),
			data: getArrayDiffData(obj1, obj2),
		};
	}

	const diff: FieldChanges = {};
	for (const key in obj1) {
		if (_.isFunction(obj1[key])) {
			continue;
		}

		let value2 = obj2[key];

		diff[key] = recursiveDiff(obj1[key], value2);
	}
	for (const key in obj2) {
		if (_.isFunction(obj2[key]) || diff[key] !== undefined) {
			// This block should never be reached since this module only passes SchemaFields to recursiveDiff (input is never a function).
			continue;
		}

		diff[key] = recursiveDiff(undefined, obj2[key]);
	}

	return diff;
};

const getArrayDiffData = (arr1: Array<any>, arr2: Array<any>) => {
	if (arr1 === undefined) {
		return arr2;
	}
	if (arr2 === undefined) {
		return arr1;
	}

	const set1 = new Set(arr1);
	const set2 = new Set(arr2);

	const deleted = [...arr1].filter((x) => !set2.has(x));
	const added = [...arr2].filter((x) => !set1.has(x));

	return {
		added,
		deleted,
	};
};

const compareArrays = (arr1: Array<any>, arr2: Array<any>) => {
	if (_.isEqual(_.sortBy(arr1), _.sortBy(arr2))) {
		return ValueChangeTypeNames.UNCHANGED;
	}
	if (arr1 === undefined) {
		return ValueChangeTypeNames.CREATED;
	}
	if (arr2 === undefined) {
		return ValueChangeTypeNames.DELETED;
	}
	return ValueChangeTypeNames.UPDATED;
};

/**
 * Compares two variables when one of them is a primitive (string, number, boolean, undefined).
 * We don't know if both are primitives or if either one of them is an object of some kind.
 * @param value1
 * @param value2
 * @returns
 */
const compareValues = (value1: any, value2: any): ValueChangeTypeName => {
	if (value1 === value2) {
		return ValueChangeTypeNames.UNCHANGED;
	}
	if (_.isDate(value1) && _.isDate(value2) && value1.getTime() === value2.getTime()) {
		return ValueChangeTypeNames.UNCHANGED;
	}
	if (value1 === undefined) {
		return ValueChangeTypeNames.CREATED;
	}
	if (value2 === undefined) {
		return ValueChangeTypeNames.DELETED;
	}
	return ValueChangeTypeNames.UPDATED;
};

const isValue = (x: any): x is string | number | boolean | undefined => {
	return !_.isObject(x) && !_.isArray(x);
};

/**
 * Found on GitHub, Doesn't work for nested arrays (not currently a problem)
 * Deep diff between two object, using lodash
 * @param  past Object compared
 * @param  present   Object to compare with
 * @return {Object}        Return a diff object
 */
const diffFields = (past?: SchemaField, present?: SchemaField) => {
	const diff = recursiveDiff(past, present);
	return removeUnchanged(diff) || {};
};

const isValueChange = (input: FieldChanges): input is ValueChange => ValueChange.safeParse(input).success;

/**
 * Remove all ValueChange objects that have type UNCHANGED.
 * This is recursive since FieldChanges can be nested.
 *
 * **WARNING**: As written this has side effects. The original input argument will have UNCHANGED entries removed.
 * @param diffObj
 * @returns
 */
const removeUnchanged = (diffObj: FieldChanges): FieldChanges | undefined => {
	if (isValueChange(diffObj)) {
		// if a key hasn't changed, return undefined to delete it from parent.
		if (diffObj.type == ValueChangeTypeNames.UNCHANGED) {
			return undefined;
		} else {
			return diffObj;
		}
	}

	// check all sub keys to see if anything nested like restrictions.codeList
	// iterate over keys
	for (const k in diffObj) {
		// recursive call for each sub object
		const childResult = removeUnchanged(diffObj[k]);
		if (childResult) {
			diffObj[k] = childResult;
		} else {
			delete diffObj[k];
		}
	}

	if (_.isEmpty(diffObj)) {
		return undefined;
	}
	return diffObj;
};

/**
 * Returns a Map<string, SchemaField> where the key is the field path and the value is the field itself.
 * @param dict input dictionary
 */
const getFieldMap = (dict: Dictionary): Map<string, SchemaField> => {
	return dict.schemas
		.map((schema) => {
			return schema.fields.reduce<Map<string, SchemaField>>((acc, field) => {
				return acc.set(`${schema.name}.${field.name}`, field);
			}, new Map<string, SchemaField>());
		})
		.reduce((acc, fileMap) => {
			for (const entry of fileMap.entries()) {
				acc.set(entry[0], entry[1]);
			}
			return acc;
		}, new Map<string, SchemaField>());
};

/**
 * Computes the dictionary differences between two dictionaries.
 * @param dict1 The first dictionary in the comparison.
 * @param dict2 The second dictionary in the comparison.
 */
export const getDiff = (dict1: Dictionary, dict2: Dictionary): DictionaryDiff => {
	/*
	 * Compute the field diffs.
	 */

	// Construct field maps
	const fields1 = getFieldMap(dict1);
	const fields2 = getFieldMap(dict2);

	const fileDiffMap = new Map<string, FieldDiff>();

	// See which exist in both or exist only in dict1
	for (const field of fields1.entries()) {
		const [fieldPath, field1Content] = field;
		const field2Content = fields2.get(fieldPath);
		if (field2Content) {
			if (!_.isEqual(field1Content, field2Content)) {
				fileDiffMap.set(fieldPath, {
					left: field1Content,
					right: field2Content,
					diff: diffFields(field1Content, field2Content),
				});
			}

			// Deleting used fields as we go so that after the fields1 loop we know what fields are in dict2 only
			fields2.delete(fieldPath);
		} else {
			fileDiffMap.set(fieldPath, {
				left: field1Content,
				diff: diffFields(field1Content, undefined),
			});
		}
	}
	// Exist only in dict2 - fields found in both were deleted from fields2 map in the loop above
	for (const [fieldPath, fieldContent] of fields2.entries()) {
		fileDiffMap.set(fieldPath, {
			right: fieldContent,
			diff: diffFields(undefined, fieldContent),
		});
	}

	return fileDiffMap;
};

/**
 * Type Utility. Convert the output of DiffUtils.getDiff into an array to loop over and can be serialized.
 * @param diff
 * @returns
 */
export const diffMapToArray = (diff: DictionaryDiff): DictionaryDiffArray => Array.from(diff);

/**
 * Type Utility. Convert the a DictionaryDiffArray, like the type returned by the Lectern Server getDiff
 * @param diff
 * @returns
 */
export const diffArrayToMap = (diffArray: DictionaryDiffArray): DictionaryDiff => {
	const output = new Map<string, FieldDiff>();
	diffArray.forEach((tuple) => output.set(tuple[0], tuple[1]));
	return output;
};

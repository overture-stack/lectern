import { DictionaryDocument } from "../models/Dictionary";
import * as _ from "lodash";

interface Field {
    name: string;
}

interface FieldDiff {
    left?: Field | any;
    right?: Field | any;
    diff: any;
}


const deepDiffMapper = function () {
    return {
      VALUE_CREATED: "created",
      VALUE_UPDATED: "updated",
      VALUE_DELETED: "deleted",
      VALUE_UNCHANGED: "unchanged",
      map: function(obj1: any, obj2: any) {
        if (this.isFunction(obj1) || this.isFunction(obj2)) {
          throw "Invalid argument. Function given, object expected.";
        }
        if (this.isValue(obj1) || this.isValue(obj2)) {
          return {
            type: this.compareValues(obj1, obj2),
            data: obj2 === undefined ? obj1 : obj2
          };
        }

        if (this.isArray(obj1) || this.isArray(obj2)) {
          return {
            type: this.compareArrays(obj1, obj2),
            data: this.getArrayDiffData(obj1, obj2)
          };
        }

        const diff: any = {};
        for (const key in obj1) {

          if (this.isFunction(obj1[key])) {
            continue;
          }

          let value2 = undefined;
          if (obj2[key] !== undefined) {
            value2 = obj2[key];
          }

          diff[key] = this.map(obj1[key], value2);
        }
        for (const key in obj2) {
          if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
            continue;
          }

          diff[key] = this.map(undefined, obj2[key]);
        }

        return diff;

      },

      getArrayDiffData: function(arr1: Array<any>, arr2: Array<any>) {
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);

        if (arr1 === undefined || arr2 === undefined) {
           return arr1 === undefined ? arr1 : arr2;
        }
        const deleted = [...arr1].filter(x => !set2.has(x));

        const added = [...arr2].filter(x => !set1.has(x));

        return {
          added, deleted
        };

      },

      compareArrays: function(arr1: Array<any>, arr2: Array<any>) {
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        if (_.isEqual(_.sortBy(arr1), _.sortBy(arr2))) {
          return this.VALUE_UNCHANGED;
        }
        if (arr1 === undefined) {
          return this.VALUE_CREATED;
        }
        if (arr2 === undefined) {
          return this.VALUE_DELETED;
        }
        return this.VALUE_UPDATED;
      },
      compareValues: function (value1: any, value2: any) {
        if (value1 === value2) {
          return this.VALUE_UNCHANGED;
        }
        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
          return this.VALUE_UNCHANGED;
        }
        if (value1 === undefined) {
          return this.VALUE_CREATED;
        }
        if (value2 === undefined) {
          return this.VALUE_DELETED;
        }
        return this.VALUE_UPDATED;
      },
      isFunction: function (x: any) {
        return Object.prototype.toString.call(x) === "[object Function]";
      },
      isArray: function (x: any) {
        return Object.prototype.toString.call(x) === "[object Array]";
      },
      isDate: function (x: any) {
        return Object.prototype.toString.call(x) === "[object Date]";
      },
      isObject: function (x: any) {
        return Object.prototype.toString.call(x) === "[object Object]";
      },
      isValue: function (x: any) {
        return !this.isObject(x) && !this.isArray(x);
      }
    };
  }();

/**
 * Computes the dictionary differences between two dictionaries.
 * @param dict1 The first dictionary in the comparison.
 * @param dict2 The second dictionary in the comparison.
 */
export const diff = (dict1: DictionaryDocument, dict2: DictionaryDocument): Map<string, FieldDiff> => {

    /*
     * Compute the field diffs.
     */

     // Construct field maps
    const fields1 = getFieldMap(dict1);
    const fields2 = getFieldMap(dict2);

    const fileDiffMap = new Map<string, FieldDiff>();

    // See which exist in both or exist only in dict1
    for (const field of fields1.entries()) {
        const fieldPath = field[0];
        if (fields2.has(fieldPath)) {
            if (!_.isEqual(field[1], fields2.get(fieldPath))) {
                fileDiffMap.set(fieldPath, {
                    left: field[1],
                    right: fields2.get(fieldPath),
                    diff: diffJson(field[1], fields2.get(fieldPath))
                });
            }
            fields2.delete(fieldPath); // Optimization for dict2
        } else {
            fileDiffMap.set(fieldPath, {
                left: field[1],
                diff: diffJson(field[1], undefined)
            });
        }
    }
    // Exist only in dict2
    for (const field of fields2.entries()) {
        fileDiffMap.set(field[0], {
            right: field[1],
            diff: diffJson(undefined, field[1])
        });
    }

    return fileDiffMap;
};

/**
 * Found on GitHub, Doesn't work for nested arrays (not currently a problem)
 * Deep diff between two object, using lodash
 * @param  {Object} past Object compared
 * @param  {Object} present   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const diffJson = (past: any,  present: any) => {
    const diff = deepDiffMapper.map(past, present);
    return removeUnchanged(diff) || {};
};

const removeUnchanged = (diffObj: any) => {
    if (!deepDiffMapper.isObject(diffObj)) {
        return diffObj;
    }

    if (diffObj.type) {
        // if a key hasn't changed, return undefined to delete it from parent.
        if (diffObj.type == deepDiffMapper.VALUE_UNCHANGED) {
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
 * Returns a Map<string, any> where the key is the field path and the value is the field itself.
 * @param dict input dictionary
 */
export const getFieldMap = (dict: DictionaryDocument): Map<string, any> => {
    const schemas = dict.schemas;
    return schemas.map(file => {
        return file.fields.reduce( (acc: Map<string, any>, field: any) => {
            return acc.set(`${file.name}.${field.name}`, field);
        }, new Map<string, any>() );
    }).reduce((acc: Map<string, any>, fileMap: Map<string, any>) => {
        for (const entry of fileMap.entries()) {
            acc.set(entry[0], entry[1]);
        }
        return acc;
    }, new Map<string, any>());
};

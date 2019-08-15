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
                fileDiffMap.set(fieldPath, {left: field[1], right: fields2.get(fieldPath), diff: diffJson(fields2.get(fieldPath), field[1])});
            }
            fields2.delete(fieldPath); // Optimization for dict2
        } else {
            fileDiffMap.set(fieldPath, {left: field[1], diff: field[1]});
        }
    }
    // Exist only in dict2
    for (const field of fields2.entries()) {
        fileDiffMap.set(field[0], {right: field[1], diff: field[1]});
    }

    return fileDiffMap;
};

/**
 * Found on GitHub, Doesn't work for nested arrays (not currently a problem)
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const diffJson = (object: any, base: any) => {
    const changes = (object: any, base: any) => {
        return _.transform(object, function(result: any, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    };
    return changes(object, base);
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

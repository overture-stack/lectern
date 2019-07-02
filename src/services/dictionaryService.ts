import { Dictionary, DictionaryDocument } from "../models/Dictionary";
import { ConflictError, InternalServerError } from "../utils/errors";
import { Mongoose } from "mongoose";

export const findOne = (name: string, version: string): DictionaryDocument => {
    return undefined;
};

/**
 * Return array of dictionaries.
 */
export const listAll = async (): Promise<DictionaryDocument[]> => {
    const dicts = await Dictionary.find({}, "name version", (err, docs) => {
        return docs;
    });
    return dicts;
};

/**
 * Create a new dictionary and throw conflict if that version exists.
 */
export const create = async (newDict: {name: string, version: string, files: any[]}): Promise<void> => {
    const doc = await Dictionary.findOne({
        "name": newDict.name,
        "version": newDict.version
    }).exec();

    if (doc) {
        throw new ConflictError("This dictionary version already exists.");
    }

    const dict = new Dictionary({
        name: newDict.name,
        version: newDict.version,
        files: newDict.files
    });

    await dict.save((err) => {
        if (err) {
            throw new InternalServerError("Could not save dictionary.");
        }
    });
};

import { Dictionary, DictionaryDocument } from "../models/Dictionary";
import { ConflictError, InternalServerError, BadRequestError } from "../utils/errors";
import { validate } from "../services/schemaService";

/**
 * Return a single dictionary
 * @param name Name of the Dictionary
 * @param version Version of the dictionary
 */
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
 * Creates a new data dictionary version with included files, verifying version doesn't exist 
 * and that the file dictionaries are valid against the meta schema.
 * @param newDict The new data dictionary containing all of the file dictionaries
 */
export const create = async (newDict: {name: string, version: string, files: any[]}): Promise<void> => {

    // Verify files match dictionary
    newDict.files.forEach(e => {
        const result = validate(e);
        if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));
    });

    // Verify that this dictionary version doesn't already exist.
    const doc = await Dictionary.findOne({
        "name": newDict.name,
        "version": newDict.version
    }).exec();
    if (doc) throw new ConflictError("This dictionary version already exists.");

    // Save new dictionary version
    const dict = new Dictionary({
        name: newDict.name,
        version: newDict.version,
        files: newDict.files
    });
    await dict.save((err) => {
        if (err) throw new InternalServerError("Could not save dictionary.");
    });
};

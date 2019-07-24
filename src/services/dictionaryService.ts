import { Dictionary, DictionaryDocument } from "../models/Dictionary";
import { ConflictError, InternalServerError, BadRequestError, NotFoundError } from "../utils/errors";
import { validate } from "../services/schemaService";
import { incrementMajor, incrementMinor, isValidVersion, isGreater } from "../utils/version";

/**
 * Return a single dictionary
 * @param name Name of the Dictionary
 * @param version Version of the dictionary
 */
export const findOne = async (name: string, version: string): Promise<DictionaryDocument> => {
    const dict = await Dictionary.findOne({"name": name, "version": version});
    return dict;
};

/**
 * Return a single dictionary by id
 * @param id id of the Dictionary
 */
export const getOne = async (id: string): Promise<DictionaryDocument> => {
    const dict = await Dictionary.findOne({"_id": id });
    if (dict == undefined) {
        throw new NotFoundError("Cannot find dictionary with id " + id);
    }
    return dict;
};

/**
 * Return array of dictionaries.
 */
export const listAll = async (): Promise<DictionaryDocument[]> => {
    const dicts = await Dictionary.find({}, "name version");
    return dicts;
};

/**
 * Creates a new data dictionary version with included files, verifying version doesn't exist
 * and that the file dictionaries are valid against the meta schema.
 * @param newDict The new data dictionary containing all of the file dictionaries
 */
export const create = async (newDict: {name: string, version: string, files: any[]}): Promise<DictionaryDocument> => {
    // Verify version is correct format
    if (!isValidVersion(newDict.version)) {
        throw new BadRequestError("Invalid version format");
    }

    const latest = await getLatestVersion(newDict.name);

    if (!isGreater(newDict.version, latest)) {
        throw new BadRequestError(`New version for ${newDict.name} is not greater than latest existing version`);
    }

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
    const saved = await dict.save();
    return saved;
};

/**
 * Adds a new file dictionary to the specified model. File Dictionary must not already exist.
 * @param name Name of dictionary model
 * @param version Version of dictionary
 * @param file new file dictionary to add
 */
export const addFile = async (id: string, file: any): Promise<DictionaryDocument> => {
    const result = validate(file);
    if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

    // Verify that this dictionary version doesn't already exist.
    const doc = await Dictionary.findOne({
        "_id": id,
    }).exec();

    const entities = doc.files.map(f => f["name"]);
    if (entities.includes(file["name"])) throw new ConflictError("This file already exists.");

    const files = doc.files;
    files.push(file);
    // Save new dictionary version
    const dict = new Dictionary({
        name: doc.name,
        version: incrementMajor(doc.version),
        files: files
    });
    const saved = await dict.save();
    return saved;
};

/**
 * Updates a single file dictionary ensuring it's existence first and then updating the version of the model dictionary
 * @param name Name of dictionary model
 * @param version Version of dictionary
 * @param file file dictionary to add update
 * @param major true if major version to be incremented, false if minor version to be incremented
 */
export const updateFile = async (id: string, file: any, major: boolean): Promise<DictionaryDocument> => {
    const result = validate(file);
    if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

    // Verify that this dictionary version doesn't already exist.
    const doc = await Dictionary.findOne({
        "_id": id
    }).exec();

    // Ensure it exists
    const entities = doc.files.map(f => f["name"]);
    if (!entities.includes(file["name"])) throw new BadRequestError("Cannot update file dictionary that does not exist.");

    // Filter out one to update
    const files = doc.files.filter( f => !(f["name"] === file["name"]));
    files.push(file);

    // Increment Version
    const nextVersion = major ? incrementMajor(doc.version) : incrementMinor(doc.version);

    // Save new dictionary version
    const dict = new Dictionary({
        name: doc.name,
        version: nextVersion,
        files: files
    });

    const saved = await dict.save();
    return saved;
};

export const getLatestVersion = async (name: string): Promise<string> => {
    const dicts = await Dictionary.find({"name": name});
    let latest = "0.0";
    if (dicts != undefined) {
        dicts.forEach( dict => {
            if (isGreater(dict.version, latest)) {
                latest = dict.version;
            }
        });
    }
    return latest;
};

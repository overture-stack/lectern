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
    const dict = await Dictionary.findOne({ "name": name, "version": version });
    return dict;
};

/**
 * Return a single dictionary by id
 * @param id id of the Dictionary
 */
export const getOne = async (id: string): Promise<DictionaryDocument> => {
    const dict = await Dictionary.findOne({ "_id": id });
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
 * Creates a new data dictionary version with included schemas, verifying version doesn't exist
 * and that the schemas are valid against the meta schema.
 * @param newDict The new data dictionary containing all of the schemas
 */
export const create = async (newDict: { name: string, version: string, schemas: any[] }): Promise<DictionaryDocument> => {
    // Verify version is correct format
    if (!isValidVersion(newDict.version)) {
        throw new BadRequestError("Invalid version format");
    }

    const latest = await getLatestVersion(newDict.name);

    if (!isGreater(newDict.version, latest)) {
        throw new BadRequestError(`New version for ${newDict.name} is not greater than latest existing version`);
    }

    // Verify schemas match dictionary
    newDict.schemas.forEach(e => {
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
        schemas: newDict.schemas
    });
    const saved = await dict.save();
    return saved;
};

/**
 * Adds a new schemas to the specified model. Schema must not already exist.
 * @param name Name of dictionary model
 * @param version Version of dictionary
 * @param schema new schema to add
 */
export const addSchema = async (id: string, schema: any): Promise<DictionaryDocument> => {
    const result = validate(schema);
    if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

    const doc = await Dictionary.findOne({
        "_id": id,
    }).exec();
    await checkLatest(doc);

    const entities = doc.schemas.map(s => s["name"]);
    if (entities.includes(schema["name"])) throw new ConflictError("This schema already exists.");

    const schemas = doc.schemas;
    schemas.push(schema);
    // Save new dictionary version
    const dict = new Dictionary({
        name: doc.name,
        version: incrementMajor(doc.version),
        schemas: schemas
    });
    const saved = await dict.save();
    return saved;
};

/**
 * Updates a single schema ensuring it's existence first and then updating the version of the model dictionary
 * @param name Name of dictionary
 * @param version Version of dictionary
 * @param schema schema to add update
 * @param major true if major version to be incremented, false if minor version to be incremented
 */
export const updateSchema = async (id: string, schema: any, major: boolean): Promise<DictionaryDocument> => {
    const result = validate(schema);
    if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

    const doc = await Dictionary.findOne({
        "_id": id
    }).exec();
    await checkLatest(doc);

    // Ensure it exists
    const entities = doc.schemas.map(s => s["name"]);
    if (!entities.includes(schema["name"])) throw new BadRequestError("Cannot update schema that does not exist.");

    // Filter out one to update
    const schemas = doc.schemas.filter(s => !(s["name"] === schema["name"]));
    schemas.push(schema);

    // Increment Version
    const nextVersion = major ? incrementMajor(doc.version) : incrementMinor(doc.version);

    // Save new dictionary version
    const dict = new Dictionary({
        name: doc.name,
        version: nextVersion,
        schemas: schemas
    });

    const saved = await dict.save();
    return saved;
};

const getLatestVersion = async (name: string): Promise<string> => {
    const dicts = await Dictionary.find({ "name": name });
    let latest = "0.0";
    if (dicts != undefined) {
        dicts.forEach(dict => {
            if (isGreater(dict.version, latest)) {
                latest = dict.version;
            }
        });
    }
    return latest;
};

const checkLatest = async (doc: DictionaryDocument): Promise<void> => {
    if (doc === undefined) {
        throw new NotFoundError("Cannot update dictionary that does not exist.");
    }
    const latestVersion = await getLatestVersion(doc.name);
    if (latestVersion != doc.version) {
        throw new BadRequestError("Dictionary that you are trying to update is not the latest version.");
    }
};

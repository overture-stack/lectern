import { Dictionary, DictionaryDocument } from '../models/Dictionary';
import {
  ConflictError,
  InvalidReferenceError,
  BadRequestError,
  NotFoundError,
} from '../utils/errors';
import { validate } from '../services/schemaService';
import { incrementMajor, incrementMinor, isValidVersion, isGreater } from '../utils/version';
import logger from '../config/logger';
import { get, omit, cloneDeep } from 'lodash';

const getLatestVersion = async (name: string): Promise<string> => {
  const dicts = await Dictionary.find({ name: name });
  let latest = '0.0';
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
    throw new NotFoundError('Cannot update dictionary that does not exist.');
  }
  const latestVersion = await getLatestVersion(doc.name);
  if (latestVersion != doc.version) {
    throw new BadRequestError(
      'Dictionary that you are trying to update is not the latest version.',
    );
  }
};

/**
 * Return a single dictionary
 * @param name Name of the Dictionary
 * @param version Version of the dictionary
 */
export const findOne = async (name: string, version: string): Promise<DictionaryDocument> => {
  logger.info(`Find one for ${name} ${version}`);
  const dict = await Dictionary.findOne({ name: name, version: version });
  return dict;
};

/**
 * Return a single dictionary by id
 * @param id id of the Dictionary
 */
export const getOne = async (id: string): Promise<DictionaryDocument> => {
  logger.info(`Get ${id}`);
  const dict = await Dictionary.findOne({ _id: id });
  if (dict == undefined) {
    throw new NotFoundError('Cannot find dictionary with id ' + id);
  }
  return dict;
};

/**
 * Return array of dictionaries.
 */
export const listAll = async (): Promise<DictionaryDocument[]> => {
  logger.info('List all');
  const dicts = await Dictionary.find({}, 'name version');
  return dicts;
};

/**
 * Creates a new data dictionary version with included schemas, verifying version doesn't exist
 * and that the schemas are valid against the meta schema.
 * @param newDict The new data dictionary containing all of the schemas
 */
export const create = async (newDict: {
  name: string;
  version: string;
  schemas: any[];
  references: any;
}): Promise<DictionaryDocument> => {
  logger.info(`Creating new dictionary ${newDict.name} ${newDict.version}`);

  // Verify version is correct format
  if (!isValidVersion(newDict.version)) {
    throw new BadRequestError('Invalid version format');
  }

  const latest = await getLatestVersion(newDict.name);

  if (!isGreater(newDict.version, latest)) {
    logger.warn(
      `Rejected ${newDict.name} due to version ${newDict.version} being lower than latest: ${latest}`,
    );
    throw new BadRequestError(
      `New version for ${newDict.name} is not greater than latest existing version`,
    );
  }

  // Verify schemas match dictionary
  newDict.schemas.forEach(e => {
    const result = validate(e, newDict.references || {});
    if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));
  });

  // Save new dictionary version
  const dict = new Dictionary({
    name: newDict.name,
    version: newDict.version,
    schemas: newDict.schemas,
    references: newDict.references || {},
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
  logger.info(`Adding schema to ${id}`);

  const doc = await Dictionary.findOne({
    _id: id,
  }).exec();
  await checkLatest(doc);

  const references = doc.references || {};

  const result = validate(schema, references);
  if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

  const entities = doc.schemas.map(s => s['name']);
  if (entities.includes(schema['name'])) throw new ConflictError('This schema already exists.');

  const schemas = doc.schemas;
  schemas.push(schema);
  // Save new dictionary version
  const dict = new Dictionary({
    name: doc.name,
    version: incrementMajor(doc.version),
    schemas,
    references,
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
export const updateSchema = async (
  id: string,
  schema: any,
  major: boolean,
): Promise<DictionaryDocument> => {
  logger.info(`Updating schema on ${id}`);

  const doc = await Dictionary.findOne({
    _id: id,
  }).exec();
  await checkLatest(doc);

  const references = doc.references || {};

  const result = validate(schema, references);
  if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

  // Ensure it exists
  const entities = doc.schemas.map(s => s['name']);
  if (!entities.includes(schema['name']))
    throw new BadRequestError('Cannot update schema that does not exist.');

  // Filter out one to update
  const schemas = doc.schemas.filter(s => !(s['name'] === schema['name']));
  schemas.push(schema);

  // Increment Version
  const nextVersion = major ? incrementMajor(doc.version) : incrementMinor(doc.version);

  // Save new dictionary version
  const dict = new Dictionary({
    name: doc.name,
    version: nextVersion,
    schemas,
    references,
  });

  const saved = await dict.save();
  return saved;
};

/**
 *
 * @param dictionary Dictionary object, matching the mongoose documents
 * @returns Dictionary with replacements made
 */
export const replaceReferences = (dictionary: DictionaryDocument) => {
  const { schemas, references } = dictionary;

  const updatedSchemas = schemas.map(schema => replaceSchemaReferences(schema, references));
  const clone = cloneDeep(dictionary);
  clone.schemas = updatedSchemas;
  // Remove references property
  return omit(clone, 'references');
};

/**
 * @param schema
 * @param references
 */
export const replaceSchemaReferences = (schema: any, references: any) => {
  const isReferenceValue = (value: string) => {
    const regex = new RegExp('^#(/[-_A-Za-z0-9]+)+$');
    return regex.test(value);
  };

  const referenceToObjectPath = (value: string) => {
    return value
      .split('/')
      .slice(1)
      .join('.');
  };

  const clone = cloneDeep(schema);
  clone.fields.forEach((field: any) => {
    for (const key in field.restrictions) {
      const value = field.restrictions[key];

      if (isReferenceValue(value)) {
        const reference = referenceToObjectPath(value);

        const replaceValue = get(references, reference, undefined);

        // Ensure we found a value, otherwise throw error for invalid reference
        if (!replaceValue) {
          throw new InvalidReferenceError(
            `Unknown reference found - Schema: ${clone.name} Field: ${field.name} Reference: ${reference}`,
          );
        }

        field.restrictions[key] = replaceValue;
      }
    }
  });
  return clone;
};

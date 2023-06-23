/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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

import { Dictionary, DictionaryDocument } from '../models/Dictionary';
import { ConflictError, BadRequestError, NotFoundError } from '../utils/errors';
import { normalizeSchema, validate } from '../services/schemaService';
import { incrementMajor, incrementMinor, isValidVersion, isGreater } from '../utils/version';
import logger from '../config/logger';

const getLatestVersion = async (name: string): Promise<string> => {
	const dicts = await Dictionary.find({ name: name });
	let latest = '0.0';
	if (dicts != undefined) {
		dicts.forEach((dict) => {
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
		throw new BadRequestError('Dictionary that you are trying to update is not the latest version.');
	}
};

/**
 * Return a single dictionary
 * @param name Name of the Dictionary
 * @param version Version of the dictionary
 */
export const findOne = async (name: string, version: string): Promise<DictionaryDocument> => {
	logger.info(`Fetching dictionary: ${name} ${version}`);
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
		logger.warn(`Rejected ${newDict.name} due to version ${newDict.version} being lower than latest: ${latest}`);
		throw new BadRequestError(`New version for ${newDict.name} is not greater than latest existing version`);
	}

	// Verify schemas match dictionary
	newDict.schemas.forEach((e) => {
		const result = validate(e, newDict.references || {});
		if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));
	});

	const normalizedSchemas = newDict.schemas.map((schema) => normalizeSchema(schema));

	// Save new dictionary version
	const dict = new Dictionary({
		name: newDict.name,
		version: newDict.version,
		schemas: normalizedSchemas,
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

	const entities = doc.schemas.map((s) => s['name']);
	if (entities.includes(schema['name'])) throw new ConflictError('This schema already exists.');

	const normalizedSchema = normalizeSchema(schema);

	const schemas = doc.schemas;
	schemas.push(normalizedSchema);
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
export const updateSchema = async (id: string, schema: any, major: boolean): Promise<DictionaryDocument> => {
	logger.info(`Updating schema on ${id}`);

	const doc = await Dictionary.findOne({
		_id: id,
	}).exec();
	await checkLatest(doc);

	const references = doc.references || {};

	const result = validate(schema, references);
	if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

	// Ensure it exists
	const entities = doc.schemas.map((s) => s['name']);
	if (!entities.includes(schema['name'])) throw new BadRequestError('Cannot update schema that does not exist.');

	// Filter out one to update
	const schemas = doc.schemas.filter((s) => !(s['name'] === schema['name']));

	const normalizedSchema = normalizeSchema(schema);

	schemas.push(normalizedSchema);

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

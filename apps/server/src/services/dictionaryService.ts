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

import {
	BadRequestError,
	ConflictError,
	Dictionary,
	NotFoundError,
	replaceReferences,
	Schema,
	VersionUtils,
} from '@overture-stack/lectern-dictionary';
import * as immer from 'immer';
import { omit } from 'lodash';
import logger from '../config/logger';
import * as DictionaryRepo from '../db/dictionary';
import { validateDictionarySchema } from '../services/schemaService';
import type { DictionaryDocument, DictionaryDocumentSummary } from '../db/dbTypes';

/**
 * Get latest version for all dictionaries with the provided name
 * @param name
 * @returns latest version of the dictionary, or `0.0` if no dictionary exists with that name
 */
export const getLatestVersion = async (name: string): Promise<string> => {
	const dicts = await DictionaryRepo.listByName(name);
	let latest: string = '0.0';
	if (dicts != undefined) {
		dicts.forEach((dict) => {
			if (VersionUtils.isGreater(dict.version, latest)) {
				latest = dict.version;
			}
		});
	}
	return latest;
};

/**
 *
 * @param doc
 * @returns
 */
export const checkLatest = async (doc: Dictionary): Promise<boolean> => {
	const latestVersion = await getLatestVersion(doc.name);
	return latestVersion === doc.version;
};

/**
 * Return a single dictionary by id
 * @param id id of the Dictionary
 * @returns Dictionary matching the provided ID
 * @throws NotFoundError if ID is not found
 */
export const getOneById = async (id: string): Promise<DictionaryDocument> => {
	logger.debug(`Finding dictionary by ID: ${id}`);
	try {
		const dict = await DictionaryRepo.findById(id);
		if (dict == undefined) {
			logger.debug(`Unable to find dictionary by ID: ${id}`);
			throw new NotFoundError(`Cannot find`);
		}
		return dict;
	} catch (e) {
		if (e instanceof Error && e.name === 'CastError') {
			// Handle case where provided id is not matching the mongoDB _id format
			logger.error(`Mongoose CastError thrown while searching for Dictionary by ID: ${id}`, e);
			throw new NotFoundError(`Cannot find dictionary with id '${id}'`);
		}
		// Something unknown occurred, throw as usual:
		throw e;
	}
};

/**
 * Return a single dictionary matching name and version
 * @param name Name of the Dictionary
 * @param version Version of the dictionary
 * @throws NotFoundError when the dictionary is not found
 */
export const getOneByNameAndVersion = async (name: string, version: string): Promise<DictionaryDocument> => {
	logger.debug(`Fetching dictionary: ${name} ${version}`);
	const dict = await DictionaryRepo.findByNameAndVersion(name, version);
	if (dict == undefined) {
		logger.debug(`Unable to find dictionary with name '${name}' and version '${version}'.`);
		throw new NotFoundError(`Cannot find dictionary with name '${name}' and version '${version}'.`);
	}
	return dict;
};

/**
 * Return array of dictionaries.
 */
export const listAll = async (): Promise<DictionaryDocumentSummary[]> => {
	logger.debug(`Retrieving all dictionaries.`);
	return await DictionaryRepo.listAll();
};

/**
 * Creates a new data dictionary version with included schemas, verifying version doesn't exist
 * and that the schemas are valid.
 * @param newDict The new data dictionary containing all of the schemas
 */
export const create = async (newDict: Dictionary): Promise<Dictionary> => {
	logger.info(`Creating new dictionary ${newDict.name} ${newDict.version}`);

	const latestVersion = await getLatestVersion(newDict.name);

	if (!VersionUtils.isGreater(newDict.version, latestVersion)) {
		logger.warn(`Rejected ${newDict.name} due to version ${newDict.version} being lower than latest: ${latestVersion}`);
		throw new BadRequestError(`New version for ${newDict.name} is not greater than latest existing version`);
	}

	// Verify schemas match dictionary
	newDict.schemas.forEach((e) => {
		const result = validateDictionarySchema(e, newDict.references || {});
		if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));
	});

	// Save new dictionary version
	const result = await DictionaryRepo.addDictionary({
		...newDict,
		references: newDict.references || {},
	});
	return result;
};

/**
 * Adds a new schemas to the specified model. Schema must not already exist.
 * @param name Name of dictionary model
 * @param version Version of dictionary
 * @param schema new schema to add
 * @throws NotFoundError if ID is not found
 */
export const addSchema = async (id: string, schema: Schema): Promise<Dictionary> => {
	logger.info(`Adding schema '${schema.name}' to ${id}`);

	const existingDictionary = await getOneById(id);
	const isLatest = await checkLatest(existingDictionary);
	if (!isLatest) {
		throw new BadRequestError('Dictionary that you are trying to update is not the latest version.');
	}

	const result = validateDictionarySchema(schema, existingDictionary.references || {});
	if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

	if (existingDictionary.schemas.some((s) => s.name === schema.name)) {
		throw new ConflictError('Schema with this name already exists.');
	}

	const updatedDictionary = immer.produce(existingDictionary, (draft) => {
		draft.version = VersionUtils.incrementMajor(draft.version);
		draft.schemas = [...draft.schemas, schema];
	});

	// Save new dictionary version
	return await DictionaryRepo.addDictionary(omit(updatedDictionary, '_id'));
};

/**
 * Updates a single schema ensuring it's existence first and then updating the version of the model dictionary
 * @param name Name of dictionary
 * @param version Version of dictionary
 * @param schema schema to add update
 * @param major true if major version to be incremented, false if minor version to be incremented
 */
export const updateSchema = async (id: string, schema: Schema, major: boolean): Promise<Dictionary> => {
	logger.info(`Updating schema '${schema.name} on ${id}`);

	const existingDictionary = await getOneById(id);

	await checkLatest(existingDictionary);

	const result = validateDictionarySchema(schema, existingDictionary.references || {});
	if (!result.valid) throw new BadRequestError(JSON.stringify(result.errors));

	// Ensure it exists
	if (!existingDictionary.schemas.some((s) => s.name === schema.name)) {
		throw new NotFoundError(`Cannot update schema - Dictionary ${id} does not have a schema with name ${schema.name}.`);
	}

	// Filter out one to update
	const schemas = existingDictionary.schemas.filter((s) => !(s['name'] === schema['name']));

	schemas.push(schema);

	// Increment Version
	const nextVersion = major
		? VersionUtils.incrementMajor(existingDictionary.version)
		: VersionUtils.incrementMinor(existingDictionary.version);
	const updatedDictionary = immer.produce(existingDictionary, (draft) => {
		const filteredSchemas = draft.schemas.filter((s) => !(s['name'] === schema['name']));
		draft.schemas = [...filteredSchemas, schema];
		draft.version = nextVersion;
	});

	// Save new dictionary version
	return await DictionaryRepo.addDictionary(omit(updatedDictionary, '_id'));
};

export const downloadDictionaryByNameAndVersion = async (name: string, version: string) => {
	const dict = await getOneByNameAndVersion(name, version);
	return replaceReferences(dict);
};

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

import { Dictionary } from 'dictionary';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import type { DictionaryDocument, DictionaryDocumentSummary } from './dbTypes';

export const DictionaryModel = mongoose.model(
	'Dictionary',
	new mongoose.Schema<DictionaryDocument>(
		{
			name: { type: String, index: true }, // Index to allow quick lookup by name
			version: String,
			description: String,
			meta: Object,
			references: Object,
			schemas: Array,
		},
		{ timestamps: true },
	).index({ name: 1, version: 1 }, { unique: true }), // Ensure only one document with any given (name + version) combination
);

/**
 * Find dictionary document by ID then return the resulting Dictionary object or null if not found
 * Note: This will throw a mongo CastError if the id does not match the mongo ObjectID format
 * @param id
 * @returns
 */
export const findById = async (id: string): Promise<DictionaryDocument | null> => {
	const doc = await DictionaryModel.findOne({ _id: id }).lean(true);
	return doc ? stripExtras(doc) : doc;
};

/**
 * Find dictionary document by Name and Version then return the resulting Dictionary object or null if not found
 * @param id
 * @returns
 */
export const findByNameAndVersion = async (name: string, version: string): Promise<DictionaryDocument | null> => {
	const doc = await DictionaryModel.findOne({ name: name, version: version }).lean(true);
	return doc ? stripExtras(doc) : doc;
};

/**
 * Fetch all DBs, returning only the name, version, and description of each Dictionary
 * @returns
 */
export const listAll = async (): Promise<DictionaryDocumentSummary[]> => {
	return DictionaryModel.find({}, 'name version description').lean(true);
};

/**
 * Fetch all DBs with the provided name
 * @param name
 * @returns
 */
export const listByName = async (name: string): Promise<DictionaryDocument[]> => {
	const docs = await DictionaryModel.find({ name });
	return docs.map((doc) => stripExtras(doc.toObject()));
};

/**
 * Create a new dictionary and save it to the DB.
 * This will not overwrite an existing DB, it will throw an error if there is a conflicting document
 * @param dictionary
 * @returns
 */
export const addDictionary = async (dictionary: Dictionary): Promise<DictionaryDocument> => {
	const dict = new DictionaryModel(dictionary);
	const saved = await dict.save();
	return stripExtras(saved.toObject());
};

/**
 * Remove the mongo version property __v from the response object
 */
const stripExtras = (doc: DictionaryDocument) => omit(doc, '__v');

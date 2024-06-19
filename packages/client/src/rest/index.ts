/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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

import { unknownToString } from '@overture-stack/lectern-common';
import { Dictionary, DictionaryDiff, DictionaryDiffArray, FieldDiff } from '@overture-stack/lectern-dictionary';
import fetch from 'node-fetch';
import promiseTools from 'promise-tools';
import { loggerFor } from '../logger';
const L = loggerFor(__filename);

export interface SchemaServiceRestClient {
	fetchSchema(schemaSvcUrl: string, name: string, version: string): Promise<Dictionary>;
	fetchDiff(schemaSvcUrl: string, name: string, fromVersion: string, toVersion: string): Promise<DictionaryDiff>;
}

export const restClient: SchemaServiceRestClient = {
	fetchSchema: async (schemaSvcUrl: string, name: string, version: string): Promise<Dictionary> => {
		// for testing where we need to work against stub schema
		if (schemaSvcUrl.startsWith('file://')) {
			return await loadSchemaFromFile(version, schemaSvcUrl, name);
		}

		if (!schemaSvcUrl) {
			throw new Error('please configure a valid url to get schema from');
		}
		const url = `${schemaSvcUrl}/dictionaries?name=${name}&version=${version}`;
		try {
			L.debug(`in fetch live schema ${version}`);
			const schemaDictionary = await doRequest(url);
			// todo validate response and map it to a schema
			return schemaDictionary[0] as Dictionary;
		} catch (error: unknown) {
			L.error(`failed to fetch schema at url: ${url} - ${unknownToString(error)}`);
			throw error;
		}
	},
	fetchDiff: async (
		schemaSvcBaseUrl: string,
		name: string,
		fromVersion: string,
		toVersion: string,
	): Promise<DictionaryDiff> => {
		// TODO: Error handling (return result?)
		const url = `${schemaSvcBaseUrl}/diff?name=${name}&left=${fromVersion}&right=${toVersion}`;
		const diffResponse = await doRequest(url);

		const diffArray = DictionaryDiffArray.parse(diffResponse);

		const result: DictionaryDiff = new Map();
		for (const entry of diffArray) {
			const fieldName = entry[0];
			if (entry[1]) {
				const fieldDiff: FieldDiff = entry[1];
				result.set(fieldName, fieldDiff);
			}
		}
		return result;
	},
};

const doRequest = async (url: string) => {
	let response: any;
	try {
		const retryAttempt = 1;
		response = await promiseTools.retry({ times: 5, interval: 1000 }, async () => {
			L.debug(`fetching schema attempt #${retryAttempt}`);
			return promiseTools.timeout(fetch(url), 5000);
		});
		return await response.json();
	} catch (error: unknown) {
		L.error(`failed to fetch schema at url: ${url} - ${unknownToString(error)}`);
		throw response.status === 404 ? new Error('Not Found') : new Error('Request Failed');
	}
};

async function loadSchemaFromFile(version: string, schemaSvcUrl: string, name: string) {
	L.debug(`in fetch stub schema ${version}`);
	const result = delay<Dictionary>(1000);
	const dictionary = await result(() => {
		const dictionaries: Dictionary[] = require(schemaSvcUrl.substring(7, schemaSvcUrl.length))
			.dictionaries as Dictionary[];
		if (!dictionaries) {
			throw new Error('your mock json is not structured correctly, see sampleFiles/sample-schema.json');
		}
		const dic = dictionaries.find((d: any) => d.version === version && d.name === name);
		if (!dic) {
			return undefined;
		}
		return dic;
	});
	if (dictionary === undefined) {
		throw new Error("couldn't load stub dictionary with the criteria specified");
	}
	L.debug(`schema found ${dictionary.version}`);
	return dictionary;
}

async function loadDiffFromFile(schemaSvcBaseUrl: string, name: string, fromVersion: string, toVersion: string) {
	L.debug(`in fetch stub diffs ${name} ${fromVersion} ${toVersion}`);
	const result = delay<any>(1000);
	const diff = await result(() => {
		const diffResponse = require(schemaSvcBaseUrl.substring(7, schemaSvcBaseUrl.length)).diffs as any[];
		if (!diffResponse) {
			throw new Error('your mock json is not structured correctly, see sampleFiles/sample-schema.json');
		}

		const diff = diffResponse.find(
			(d) => d.fromVersion === fromVersion && d.toVersion === toVersion && d.name === name,
		);
		if (!diff) {
			return undefined;
		}
		return diff;
	});
	if (diff === undefined) {
		throw new Error("couldn't load stub diff with the criteria specified, check your stub file");
	}
	return diff.data;
}

function delay<T>(milliseconds: number) {
	return async (result: () => T | undefined) => {
		return new Promise<T | undefined>((resolve, reject) => {
			setTimeout(() => resolve(result()), milliseconds);
		});
	};
}

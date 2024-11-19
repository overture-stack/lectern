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

import {
	Dictionary,
	DictionaryDiff,
	DictionaryDiffArray,
	FieldDiff,
	unknownToString,
} from '@overture-stack/lectern-dictionary';
import promiseTools from 'promise-tools';
import { Logger } from '../logger';

const consoleLogger: Logger = {
	debug: (msg) => null,
	error: (msg) => null,
	info: (msg) => null,
	profile: (msg) => null,
};
let L = consoleLogger;
if (typeof process !== 'undefined') {
	import('../logger').then((logger) => {
		console.log('logger', logger);
		L = logger.loggerFor(__filename);
	});
}

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

export const fetchSchema = async (schemaSvcUrl: string, name: string, version: string): Promise<Dictionary> => {
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
};
export const fetchDiff = async (
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
};

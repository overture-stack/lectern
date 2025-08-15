/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

import { DictionaryBase, failure, success, type Result } from '@overture-stack/lectern-dictionary';
import axios, { AxiosError } from 'axios';
import { z as zod } from 'zod';
import formatAxiosError from './formatAxiosError';

const dictionaryServerRecordSchema = DictionaryBase.extend({
	_id: zod.string(),
	createdAt: zod.coerce.date(),
	updatedAt: zod.coerce.date().optional(),
});
export type DictionaryServerRecord = zod.infer<typeof dictionaryServerRecordSchema>;

const getDictionaryByNameAndVersionResponseSchema = zod.tuple([dictionaryServerRecordSchema]);
const getDictionaryByIdResponseSchema = dictionaryServerRecordSchema;

/**
 * Fetches a single Dictionary from a Lectern server. This can be done either by ID or by Name and Version.
 *
 * The option `showReferences` is available with default `false`. When `false`, the dictionary
 * will be returned with all entries that use references replaced with their reference values. When `true`,
 * all references will be left in place and the dictionary will contain a references property with all available
 * references included.
 * @param options
 * @returns
 */
export const getDictionary = async (
	lecternHost: string,
	dictionary: { id: string } | { name: string; version: string },
	options?: {
		showReferences?: boolean;
	},
): Promise<Result<DictionaryServerRecord>> => {
	const showReferences = options?.showReferences;
	try {
		if ('id' in dictionary) {
			// Fetch by ID

			const schemaDictionary = await axios.request({
				method: 'GET',
				baseURL: lecternHost,
				url: `/dictionaries/${dictionary.id}`,
				params: {
					references: !!showReferences,
				},
			});

			const parseResult = getDictionaryByIdResponseSchema.safeParse(schemaDictionary.data);
			if (!parseResult.success) {
				console.log(parseResult.error.flatten);
				return failure(
					'Unable to parse response from server. Ensure that the Lectern client and server are using compatible versions.',
				);
			}
			return success(parseResult.data);
		} else {
			// Fetch by Name and Version

			const schemaDictionary = await axios.request({
				method: 'GET',
				baseURL: lecternHost,
				url: `/dictionaries`,
				params: {
					references: !!showReferences,
					name: dictionary.name,
					version: dictionary.version,
				},
			});

			// Returns an array with one dictionary expected. Could have none.
			const parseResult = getDictionaryByNameAndVersionResponseSchema.safeParse(schemaDictionary.data);
			if (!parseResult.success) {
				console.log(parseResult.error.flatten());
				return failure(
					'Unable to parse response from server. Ensure that the Lectern client and server are using compatible versions.',
				);
			}
			return success(parseResult.data[0]);
		}
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			return failure(formatAxiosError(error));
		}
		return failure(`Unexpected error: ${error}`);
	}
};

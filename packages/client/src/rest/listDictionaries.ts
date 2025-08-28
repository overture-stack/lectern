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

import { failure, success, type Result } from '@overture-stack/lectern-dictionary';
import axios, { AxiosError } from 'axios';
import { z as zod } from 'zod';
import formatAxiosError from './formatAxiosError';

const dictionarySummarySchema = zod.object({
	_id: zod.string(),
	name: zod.string(),
	description: zod.string().optional(),
	version: zod.string(),
	createdAt: zod.coerce.date(),
});
export type DictionarySummary = zod.infer<typeof dictionarySummarySchema>;

const listDictionariesResponseSchema = zod.array(dictionarySummarySchema);

/**
 * Fetches a list of dictionaries available in the Lectern server.
 *
 * You can optionally filter the dictionary list to only the dictionaries matching a specific name.
 * @param options
 * @returns
 */
export const listDictionaries = async (
	lecternHost: string,
	options?: {
		name?: string;
	},
): Promise<Result<DictionarySummary[]>> => {
	const name = options?.name;
	try {
		const schemaDictionary = await axios.request({
			method: 'GET',
			baseURL: lecternHost,
			url: `/dictionaries`,
			params: {
				name: options?.name,
			},
		});

		const parseResult = listDictionariesResponseSchema.safeParse(schemaDictionary.data);
		if (!parseResult.success) {
			return failure(
				'Unable to parse response from server. Ensure that the Lectern client and server are using compatible versions.',
			);
		}
		return success(parseResult.data);
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			return failure(formatAxiosError(error));
		}
		return failure(`Unexpected error: ${error}`);
	}
};

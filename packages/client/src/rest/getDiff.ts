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

import { DictionaryDiffArray, failure, success, type Result } from '@overture-stack/lectern-dictionary';
import axios, { AxiosError } from 'axios';
import formatAxiosError from './formatAxiosError';

const getDiffResponseSchema = DictionaryDiffArray;

/**
 * Fetches from a Lectern server the diff array between two versions of the same dictionary.
 *
 * This function requires a left (current) and right (previous) version of the dictionary to compare.
 * If the server has both versions, then an array of all fields that have differences will be returned.
 */
export const getDiff = async (
	lecternHost: string,
	dictionary: { name: string; leftVersion: string; rightVersion: string },
	options?: {
		showReferences?: boolean;
	},
): Promise<Result<DictionaryDiffArray>> => {
	try {
		const diffResponse = await axios.request({
			method: 'GET',
			baseURL: lecternHost,
			url: `/diff`,
			params: {
				name: dictionary.name,
				left: dictionary.leftVersion,
				right: dictionary.rightVersion,

				references: options?.showReferences,
			},
		});

		const parseResult = getDiffResponseSchema.safeParse(diffResponse.data);
		if (!parseResult.success) {
			console.log(parseResult.error.flatten);
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

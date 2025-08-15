/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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

import { Dictionary } from '@overture-stack/lectern-dictionary';

function validateHostedDictionaries(input: unknown): Dictionary {
	// User may provide an array or a single dictionary as input, should be able to process both
	const asSingle = Dictionary.safeParse(input);
	if (asSingle.success) {
		return asSingle.data;
	}

	const message = asSingle.error?.message ?? 'Unknown validation error';
	throw new Error(`Hosted dictionary validation failed: ${message}`);
}

/**
 * Fetches and validates hosted dictionaries from the given URL.
 * @param hostedUrl - The URL to fetch the hosted dictionaries from.
 * @returns {Promise<Dictionary>} A promise that resolves to an array of Dictionaries
 */
export async function fetchAndValidateHostedDictionaries(hostedUrl: string): Promise<Dictionary> {
	const res = await fetch(hostedUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch hosted dictionaries: ${res.status}`);
	}
	const json = await res.json();
	return validateHostedDictionaries(json);
}

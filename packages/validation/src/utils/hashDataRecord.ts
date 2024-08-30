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

import type { DataRecord, DataRecordValue } from '@overture-stack/lectern-dictionary';

/**
 * Create a unique string out of an arbitrary array of data record values. This can be used
 * as a unique identifier for an object with these properties and values. This type of hash is needed
 * to check uniqueKey constraints.
 *
 * To generate a unique string from an object, the object is converted to an array of [key, value] tuples.
 * Properties with an `undefiend` value are filtered out.
 * These tuples are sorted by key name to ensure they are compared in the same order.
 * Finally, the array is stringified using JSON.stringify().
 *
 * This can be used to compare uniqueKeys across many data records by building a map of the hash of
 * the uniqueKey values from each record.
 * @param values any DataRecord or subset of fields from a DataRecord
 */
export const hashDataRecord = (values: DataRecord): string => {
	const normalizedValues = Object.entries(values)
		.filter(([_key, value]) => value !== undefined)
		.sort(([keyA], [keyB]) => (keyA < keyB ? -1 : 1));
	return JSON.stringify(normalizedValues);
};

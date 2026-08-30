/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import type { DataRecord, DataRecordValue, Schema } from '@overture-stack/lectern-dictionary';
import { type ForeignKeyPool, generateRecord } from './recordGenerator';

type UniqueFieldTracker = Map<string, Set<DataRecordValue>>;

const serializeKeyTuple = (schema: Schema, record: DataRecord): string =>
	JSON.stringify((schema.restrictions?.uniqueKey ?? []).map((fieldName) => record[fieldName]));

/**
 * Options for `generateSchemaRecords`.
 *
 * `initialUniqueValues` pre-populates the uniqueness trackers to avoid collisions with records
 * already written elsewhere (e.g. when appending to an existing file).
 * `fields` maps field names to arrays of pre-seen values for `unique` fields.
 * `keys` is an array of pre-seen serialized `uniqueKey` tuples (`JSON.stringify(keyFieldValues)`).
 *
 * All other options behave identically to `RecordGeneratorOptions`.
 */
export type SchemaGeneratorOptions = {
	count: number;
	seed?: number;
	foreignKeyPool?: ForeignKeyPool;
	emptyRate?: number;
	initialUniqueValues?: {
		fields?: Record<string, DataRecordValue[]>;
		keys?: string[];
	};
};

const MAX_UNIQUE_KEY_RETRIES = 10;

// Derives a unique retry seed for a given record seed and retry attempt number using a Knuth
// multiplicative hash + xorshift32. Each (recordSeed, retryCount) pair produces a distinct,
// well-distributed seed that is independent of the main record seed sequence.
const deriveRetrySeed = (recordSeed: number, retryCount: number): number => {
	let hash = ((recordSeed ^ (retryCount * 2246822519)) * 2654435761 + 1) >>> 0;
	hash ^= hash << 13;
	hash ^= hash >>> 17;
	hash ^= hash << 5;
	return hash >>> 0;
};

/**
 * Synchronous generator that yields `options.count` `DataRecord` values for `schema`.
 *
 * Enforces `unique` field constraints by excluding already-seen values from each field generator.
 * Enforces `uniqueKey` constraints by retrying generation (up to 10 times) when a composite key
 * tuple collides. After exhausting retries the record is yielded as-is.
 */
export function* generateSchemaRecords(schema: Schema, options?: SchemaGeneratorOptions): Generator<DataRecord> {
	const { count = 0, seed, foreignKeyPool, emptyRate, initialUniqueValues } = options ?? {};

	const uniqueFields = schema.fields.filter((field) => field.unique === true);
	const uniqueKeyFields = schema.restrictions?.uniqueKey ?? [];

	const uniqueFieldTracker: UniqueFieldTracker = new Map(
		uniqueFields.map((field) => {
			const initialValues = initialUniqueValues?.fields?.[field.name] ?? [];
			return [field.name, new Set<DataRecordValue>(initialValues)];
		}),
	);

	const uniqueKeyTracker = new Set<string>(initialUniqueValues?.keys ?? []);

	for (let recordIndex = 0; recordIndex < count; recordIndex++) {
		const fieldExclusions: Record<string, Set<DataRecordValue>> = {};
		for (const [fieldName, seenValues] of uniqueFieldTracker) {
			fieldExclusions[fieldName] = seenValues;
		}

		const recordSeed = seed !== undefined ? seed + recordIndex + 1 : undefined;
		let record = generateRecord(schema, { seed: recordSeed, foreignKeyPool, emptyRate, fieldExclusions });

		if (uniqueKeyFields.length > 0) {
			let retryCount = 0;
			while (uniqueKeyTracker.has(serializeKeyTuple(schema, record)) && retryCount < MAX_UNIQUE_KEY_RETRIES) {
				retryCount++;
				const retrySeed = recordSeed !== undefined ? deriveRetrySeed(recordSeed, retryCount) : undefined;
				record = generateRecord(schema, { seed: retrySeed, foreignKeyPool, emptyRate, fieldExclusions });
			}
			uniqueKeyTracker.add(serializeKeyTuple(schema, record));
		}

		for (const [fieldName, seenValues] of uniqueFieldTracker) {
			seenValues.add(record[fieldName]);
		}

		yield record;
	}
}

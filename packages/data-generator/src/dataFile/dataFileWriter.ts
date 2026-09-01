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

import fs from 'node:fs';
import type { DataRecord, DataRecordValue, Result, Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import { DEFAULT_DELIMITER, failWith, success } from '@overture-stack/lectern-dictionary';
import { COLUMN_DELIMITER, type DataFileFormat } from '../common/fileTypes';

const STREAM_CLOSED = 'STREAM_CLOSED' as const;

/** Failure data returned by `writeRecord` when the file handle has already been closed. */
export type WriteRecordError = { error: typeof STREAM_CLOSED };

/**
 * An open handle to a data file being written. Created by `openDataFile`, `openTsvFile`, or
 * `openCsvFile`. Pass to `writeRecord` to append rows and to `closeDataFile` when done.
 *
 * The underlying write stream is managed internally; do not retain references beyond the
 * lifetime of the file handle.
 */
export type DataFileHandle = {
	readonly schema: Schema;
	readonly format: DataFileFormat;
};

const streamRegistry = new Map<DataFileHandle, fs.WriteStream>();

const serializeValue = (value: DataRecordValue, field: SchemaField): string => {
	if (value === undefined) {
		return '';
	}
	if (Array.isArray(value)) {
		return value.map(String).join(field.delimiter ?? DEFAULT_DELIMITER);
	}
	return String(value);
};

const serializeRecord = (record: DataRecord, schema: Schema, columnDelimiter: string): string => {
	const values = schema.fields.map((field) => serializeValue(record[field.name], field));
	return values.join(columnDelimiter) + '\n';
};

const writeToStream = (stream: fs.WriteStream, data: string): Promise<void> =>
	new Promise((resolve, reject) => {
		// Attach the error listener before calling write so that errors emitted synchronously
		// or before the write callback fires are not missed.
		stream.once('error', reject);
		const canContinue = stream.write(data, (writeError) => {
			if (writeError !== undefined && writeError !== null) {
				reject(writeError);
			}
		});
		if (canContinue) {
			stream.off('error', reject);
			resolve();
		} else {
			stream.once('drain', () => {
				stream.off('error', reject);
				resolve();
			});
		}
	});

/**
 * Opens a new data file for writing and writes the header row. The header columns are the
 * field names from `schema.fields` in definition order, separated by the format delimiter.
 *
 * Returns a `DataFileHandle` that must be passed to `writeRecord` and `closeDataFile`.
 * Always call `closeDataFile` when done to flush and close the underlying stream.
 */
export const openDataFile = async (
	schema: Schema,
	filePath: string,
	format: DataFileFormat,
): Promise<DataFileHandle> => {
	const stream = fs.createWriteStream(filePath);
	const columnDelimiter = COLUMN_DELIMITER[format];

	const header = schema.fields.map((field) => field.name).join(columnDelimiter) + '\n';
	await writeToStream(stream, header);

	const handle: DataFileHandle = { schema, format };
	streamRegistry.set(handle, stream);
	return handle;
};

/** Convenience wrapper for `openDataFile` that opens the file in TSV (tab-separated) format. */
export const openTsvFile = (schema: Schema, filePath: string): Promise<DataFileHandle> =>
	openDataFile(schema, filePath, 'tsv');

/** Convenience wrapper for `openDataFile` that opens the file in CSV (comma-separated) format. */
export const openCsvFile = (schema: Schema, filePath: string): Promise<DataFileHandle> =>
	openDataFile(schema, filePath, 'csv');

/**
 * Serializes `record` and appends it as a row to the file associated with `handle`.
 *
 * Fields absent from `record`are written as empty strings. Fields present in `record`
 * but absent from the schema are ignored. Array field values are joined with
 * `field.delimiter` (falling back to `DEFAULT_DELIMITER`) — distinct from the column
 * delimiter set by the file format.
 *
 * Returns a failure with `{ error: 'STREAM_CLOSED' }` if `handle` has already been closed.
 */
export const writeRecord = async (
	handle: DataFileHandle,
	record: DataRecord,
): Promise<Result<void, WriteRecordError>> => {
	const stream = streamRegistry.get(handle);
	if (stream === undefined) {
		return failWith('Cannot write to a closed file handle.', { error: STREAM_CLOSED });
	}
	const columnDelimiter = COLUMN_DELIMITER[handle.format];
	const row = serializeRecord(record, handle.schema, columnDelimiter);
	await writeToStream(stream, row);
	return success(undefined);
};

/**
 * Flushes and closes the file associated with `handle`. Resolves once the underlying stream
 * has finished writing. Calling `closeDataFile` on an already-closed handle is a no-op.
 */
export const closeDataFile = (handle: DataFileHandle): Promise<void> => {
	const stream = streamRegistry.get(handle);
	if (stream === undefined) {
		return Promise.resolve();
	}
	streamRegistry.delete(handle);
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject);
		stream.end();
	});
};

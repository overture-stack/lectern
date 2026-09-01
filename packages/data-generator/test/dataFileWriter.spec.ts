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

import assert from 'node:assert';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, afterEach, before, describe, it } from 'mocha';
import type { Schema } from '@overture-stack/lectern-dictionary';
import { DEFAULT_DELIMITER } from '@overture-stack/lectern-dictionary';
import { closeDataFile, openCsvFile, openDataFile, openTsvFile, writeRecord } from '../src/dataFile/dataFileWriter';

const schema: Schema = {
	name: 'test',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: undefined },
		{ name: 'count', valueType: 'integer', restrictions: undefined },
		{ name: 'active', valueType: 'boolean', restrictions: undefined },
	],
};

const schemaWithArray: Schema = {
	name: 'array_test',
	fields: [
		{ name: 'id', valueType: 'string', restrictions: undefined },
		{ name: 'tags', valueType: 'string', isArray: true, delimiter: ';', restrictions: undefined },
	],
};

let tempDir: string;

before(async () => {
	tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'data-file-writer-test-'));
});

after(async () => {
	await fsp.rm(tempDir, { recursive: true, force: true });
});

const tempFile = (name: string): string => path.join(tempDir, name);

const readLines = async (filePath: string): Promise<string[]> => {
	const content = await fsp.readFile(filePath, 'utf8');
	return content.split('\n').filter((line) => line.length > 0);
};

describe('dataFileWriter', () => {
	describe('openTsvFile', () => {
		it('writes a header row with tab-separated field names', async () => {
			const filePath = tempFile('tsv-header.tsv');
			const handle = await openTsvFile(schema, filePath);
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[0], 'id\tcount\tactive');
		});

		it('header field order matches schema.fields order', async () => {
			const filePath = tempFile('tsv-order.tsv');
			const handle = await openTsvFile(schema, filePath);
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			const headers = lines[0]?.split('\t') ?? [];
			assert.deepStrictEqual(headers, ['id', 'count', 'active']);
		});
	});

	describe('openCsvFile', () => {
		it('writes a header row with comma-separated field names', async () => {
			const filePath = tempFile('csv-header.csv');
			const handle = await openCsvFile(schema, filePath);
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[0], 'id,count,active');
		});
	});

	describe('openDataFile', () => {
		it('tsv format uses tab as column delimiter', async () => {
			const filePath = tempFile('format-tsv.tsv');
			const handle = await openDataFile(schema, filePath, 'tsv');
			await writeRecord(handle, { id: 'a', count: 1, active: true });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], 'a\t1\ttrue');
		});

		it('csv format uses comma as column delimiter', async () => {
			const filePath = tempFile('format-csv.csv');
			const handle = await openDataFile(schema, filePath, 'csv');
			await writeRecord(handle, { id: 'a', count: 1, active: true });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], 'a,1,true');
		});
	});

	describe('writeRecord', () => {
		it('returns a success result when the write succeeds', async () => {
			const filePath = tempFile('write-success.tsv');
			const handle = await openTsvFile(schema, filePath);
			const result = await writeRecord(handle, { id: 'a', count: 1, active: true });
			await closeDataFile(handle);
			assert.strictEqual(result.success, true);
		});

		it('appends rows in the order writeRecord was called', async () => {
			const filePath = tempFile('order.tsv');
			const handle = await openTsvFile(schema, filePath);
			await writeRecord(handle, { id: 'first', count: 1, active: true });
			await writeRecord(handle, { id: 'second', count: 2, active: false });
			await writeRecord(handle, { id: 'third', count: 3, active: true });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], 'first\t1\ttrue');
			assert.strictEqual(lines[2], 'second\t2\tfalse');
			assert.strictEqual(lines[3], 'third\t3\ttrue');
		});

		it('column order follows schema.fields regardless of record key order', async () => {
			const filePath = tempFile('col-order.tsv');
			const handle = await openTsvFile(schema, filePath);
			// Record keys in reverse order
			await writeRecord(handle, { active: true, count: 7, id: 'z' });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			// Columns must still be id, count, active
			assert.strictEqual(lines[1], 'z\t7\ttrue');
		});

		it('field missing from record serializes as empty string', async () => {
			const filePath = tempFile('missing-field.tsv');
			const handle = await openTsvFile(schema, filePath);
			await writeRecord(handle, { id: 'x' }); // count and active omitted
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], 'x\t\t');
		});

		it('undefined field value serializes as empty string', async () => {
			const filePath = tempFile('undefined-field.tsv');
			const handle = await openTsvFile(schema, filePath);
			await writeRecord(handle, { id: 'x', count: undefined, active: undefined });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], 'x\t\t');
		});

		it('extra fields in record not present in schema are ignored', async () => {
			const filePath = tempFile('extra-fields.tsv');
			const handle = await openTsvFile(schema, filePath);
			await writeRecord(handle, { id: 'x', count: 1, active: true, extra: 'ignored' });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			const columns = lines[1]?.split('\t') ?? [];
			assert.strictEqual(columns.length, 3);
		});

		it('array field uses field.delimiter not column delimiter', async () => {
			const filePath = tempFile('array-delimiter.tsv');
			const handle = await openTsvFile(schemaWithArray, filePath);
			await writeRecord(handle, { id: 'x', tags: ['a', 'b', 'c'] });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			// tags column should use ';' (field.delimiter), not '\t' (column delimiter)
			assert.strictEqual(lines[1], 'x\ta;b;c');
		});

		it('array field with no field.delimiter uses DEFAULT_DELIMITER', async () => {
			const schemaNoDelimiter: Schema = {
				name: 'no_delim',
				fields: [
					{ name: 'id', valueType: 'string', restrictions: undefined },
					{ name: 'tags', valueType: 'string', isArray: true, restrictions: undefined },
				],
			};
			const filePath = tempFile('array-default-delimiter.tsv');
			const handle = await openTsvFile(schemaNoDelimiter, filePath);
			await writeRecord(handle, { id: 'x', tags: ['a', 'b'] });
			await closeDataFile(handle);

			const lines = await readLines(filePath);
			assert.strictEqual(lines[1], `x\ta${DEFAULT_DELIMITER}b`);
		});
	});

	describe('closeDataFile', () => {
		it('closes the underlying stream', async () => {
			const filePath = tempFile('close.tsv');
			const handle = await openTsvFile(schema, filePath);
			await closeDataFile(handle);

			// File should be fully written and readable
			const exists = fs.existsSync(filePath);
			assert.ok(exists);
		});

		it('calling closeDataFile twice does not throw', async () => {
			const filePath = tempFile('double-close.tsv');
			const handle = await openTsvFile(schema, filePath);
			await closeDataFile(handle);
			await assert.doesNotReject(() => closeDataFile(handle));
		});

		it('writeRecord after close returns a STREAM_CLOSED failure result', async () => {
			const filePath = tempFile('write-after-close.tsv');
			const handle = await openTsvFile(schema, filePath);
			await closeDataFile(handle);
			const result = await writeRecord(handle, { id: 'x', count: 1, active: true });
			assert.strictEqual(result.success, false);
			assert.strictEqual(result.data.error, 'STREAM_CLOSED');
		});
	});

	it('produces identical file content for the same records written in the same order', async () => {
		const records = [
			{ id: 'a', count: 1, active: true },
			{ id: 'b', count: 2, active: false },
		];

		const filePathA = tempFile('deterministic-a.tsv');
		const handleA = await openTsvFile(schema, filePathA);
		for (const record of records) {
			await writeRecord(handleA, record);
		}
		await closeDataFile(handleA);

		const filePathB = tempFile('deterministic-b.tsv');
		const handleB = await openTsvFile(schema, filePathB);
		for (const record of records) {
			await writeRecord(handleB, record);
		}
		await closeDataFile(handleB);

		const contentA = await fsp.readFile(filePathA, 'utf8');
		const contentB = await fsp.readFile(filePathB, 'utf8');
		assert.strictEqual(contentA, contentB);
	});
});

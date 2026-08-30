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
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'mocha';
import type { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { generateDictionaryFiles, generateSchemaFile } from '../src/dataFile/dataFileGenerator';

const SEED = 42;
const NO_EMPTY = { emptyRate: 0 } as const;

const donorSchema: Schema = {
	name: 'donor',
	fields: [
		{ name: 'id', valueType: 'string', unique: true, restrictions: undefined },
		{ name: 'program', valueType: 'string', restrictions: { codeList: ['P1', 'P2'] } },
	],
};

const sampleSchema: Schema = {
	name: 'sample',
	fields: [
		{ name: 'sample_id', valueType: 'string', unique: true, restrictions: undefined },
		{ name: 'donor_id', valueType: 'string', restrictions: undefined },
	],
	restrictions: {
		foreignKey: [{ schema: 'donor', mappings: [{ local: 'donor_id', foreign: 'id' }] }],
	},
};

const dictionary: Dictionary = {
	name: 'test-dictionary',
	version: '1.0',
	schemas: [donorSchema, sampleSchema],
};

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-generator-test-'));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('generateSchemaFile', () => {
	it('creates a file named <schema.name>.<format> in the output directory', async () => {
		await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 3, seed: SEED, ...NO_EMPTY });
		assert.ok(fs.existsSync(path.join(tmpDir, 'donor.tsv')));
	});

	it('writes the correct number of data rows plus one header row', async () => {
		await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 3, seed: SEED, ...NO_EMPTY });
		const lines = fs.readFileSync(path.join(tmpDir, 'donor.tsv'), 'utf8').trim().split('\n');
		assert.strictEqual(lines.length, 4); // 1 header + 3 data
	});

	it('first row is the header with schema field names', async () => {
		await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 1, seed: SEED, ...NO_EMPTY });
		const lines = fs.readFileSync(path.join(tmpDir, 'donor.tsv'), 'utf8').split('\n');
		assert.strictEqual(lines[0], 'id\tprogram');
	});

	it('uses comma delimiter for csv format', async () => {
		await generateSchemaFile(donorSchema, tmpDir, 'csv', { count: 1, seed: SEED, ...NO_EMPTY });
		const lines = fs.readFileSync(path.join(tmpDir, 'donor.csv'), 'utf8').split('\n');
		assert.strictEqual(lines[0], 'id,program');
	});

	it('returns failure when the output directory does not exist', async () => {
		const result = await generateSchemaFile(donorSchema, path.join(tmpDir, 'nonexistent'), 'tsv', {
			count: 1,
			seed: SEED,
		});
		assert.strictEqual(result.success, false);
		assert.strictEqual(result.data.error, 'DIRECTORY_NOT_FOUND');
	});

	it('returns failure when the output file already exists', async () => {
		fs.writeFileSync(path.join(tmpDir, 'donor.tsv'), 'existing content');
		const result = await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 1, seed: SEED });
		assert.strictEqual(result.success, false);
		assert.strictEqual(result.data.error, 'FILE_ALREADY_EXISTS');
	});

	it('does not modify an existing file on failure', async () => {
		const existingPath = path.join(tmpDir, 'donor.tsv');
		fs.writeFileSync(existingPath, 'existing content');
		await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 1, seed: SEED });
		assert.strictEqual(fs.readFileSync(existingPath, 'utf8'), 'existing content');
	});

	it('file is readable (stream closed) after successful generation', async () => {
		await generateSchemaFile(donorSchema, tmpDir, 'tsv', { count: 2, seed: SEED, ...NO_EMPTY });
		const filePath = path.join(tmpDir, 'donor.tsv');
		// Verify content is fully flushed by reading it back immediately after the call returns.
		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.trim().split('\n');
		assert.strictEqual(lines.length, 3); // header + 2 data rows, all flushed
	});
});

describe('generateDictionaryFiles', () => {
	it('creates one file per schema with a non-zero count', async () => {
		await generateDictionaryFiles(dictionary, tmpDir, 'tsv', {
			counts: { donor: 3, sample: 5 },
			seed: SEED,
			...NO_EMPTY,
		});
		assert.ok(fs.existsSync(path.join(tmpDir, 'donor.tsv')));
		assert.ok(fs.existsSync(path.join(tmpDir, 'sample.tsv')));
	});

	it('does not create a file for schemas with count 0', async () => {
		await generateDictionaryFiles(dictionary, tmpDir, 'tsv', {
			counts: { donor: 3, sample: 0 },
			seed: SEED,
			...NO_EMPTY,
		});
		assert.ok(!fs.existsSync(path.join(tmpDir, 'sample.tsv')));
	});

	it('each file contains the correct number of data rows', async () => {
		await generateDictionaryFiles(dictionary, tmpDir, 'tsv', {
			counts: { donor: 2, sample: 4 },
			seed: SEED,
			...NO_EMPTY,
		});
		const donorLines = fs.readFileSync(path.join(tmpDir, 'donor.tsv'), 'utf8').trim().split('\n');
		const sampleLines = fs.readFileSync(path.join(tmpDir, 'sample.tsv'), 'utf8').trim().split('\n');
		assert.strictEqual(donorLines.length, 3); // 1 header + 2 data
		assert.strictEqual(sampleLines.length, 5); // 1 header + 4 data
	});

	it('returns failure when the output directory does not exist', async () => {
		const result = await generateDictionaryFiles(dictionary, path.join(tmpDir, 'nonexistent'), 'tsv', {
			counts: { donor: 1 },
			seed: SEED,
		});
		assert.strictEqual(result.success, false);
		assert.strictEqual(result.data.error, 'DIRECTORY_NOT_FOUND');
	});

	it('all files are readable (streams closed) after successful generation', async () => {
		await generateDictionaryFiles(dictionary, tmpDir, 'tsv', {
			counts: { donor: 2, sample: 3 },
			seed: SEED,
			...NO_EMPTY,
		});
		// Verify both files are fully flushed by reading them back immediately after generation.
		const donorContent = fs.readFileSync(path.join(tmpDir, 'donor.tsv'), 'utf8');
		const sampleContent = fs.readFileSync(path.join(tmpDir, 'sample.tsv'), 'utf8');
		assert.strictEqual(donorContent.trim().split('\n').length, 3); // header + 2
		assert.strictEqual(sampleContent.trim().split('\n').length, 4); // header + 3
	});

	it('returns failure before writing any files when any expected output file already exists', async () => {
		fs.writeFileSync(path.join(tmpDir, 'donor.tsv'), 'existing content');
		const result = await generateDictionaryFiles(dictionary, tmpDir, 'tsv', {
			counts: { donor: 2, sample: 3 },
			seed: SEED,
		});
		assert.strictEqual(result.success, false);
		assert.strictEqual(result.data.error, 'FILE_ALREADY_EXISTS');
		// sample.tsv must not have been created since we fail before writing
		assert.ok(!fs.existsSync(path.join(tmpDir, 'sample.tsv')));
	});
});

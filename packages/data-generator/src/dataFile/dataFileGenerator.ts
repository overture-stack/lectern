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
import path from 'node:path';
import type { Dictionary, Result, Schema } from '@overture-stack/lectern-dictionary';
import { failWith, success } from '@overture-stack/lectern-dictionary';
import {
	type DictionaryGeneratorOptions,
	generateDictionaryRecords,
} from '../dataGeneration/dictionary/dictionaryGenerator';
import { type SchemaGeneratorOptions, generateSchemaRecords } from '../dataGeneration/records/schemaGenerator';
import { closeDataFile, openDataFile, writeRecord } from './dataFileWriter';
import { FILE_EXTENSION, type DataFileFormat } from '../common/fileTypes';

/** Failure reasons returned by `generateSchemaFile` and `generateDictionaryFiles`. */
export type GenerateFileError =
	| { error: 'DIRECTORY_NOT_FOUND'; directory: string }
	| { error: 'FILE_ALREADY_EXISTS'; filePath: string };

const resolveOutputPath = (outputDir: string, schemaName: string, format: DataFileFormat): string =>
	path.join(outputDir, schemaName + FILE_EXTENSION[format]);

const DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND' as const;
const FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS' as const;

const checkDirectory = (outputDir: string): Result<void, GenerateFileError> => {
	if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
		return failWith(`Output directory does not exist: ${outputDir}`, {
			error: DIRECTORY_NOT_FOUND,
			directory: outputDir,
		});
	}
	return success(undefined);
};

const checkFileAbsent = (filePath: string): Result<void, GenerateFileError> => {
	if (fs.existsSync(filePath)) {
		return failWith(`File already exists: ${filePath}`, { error: FILE_ALREADY_EXISTS, filePath });
	}
	return success(undefined);
};

/**
 * Generates records for `schema` and writes them to a new file in `outputDir`.
 *
 * The output file is named `<schema.name>.<format>`. Fails without writing if the directory
 * does not exist or if the file already exists.
 */
export const generateSchemaFile = async (
	schema: Schema,
	outputDir: string,
	format: DataFileFormat,
	options?: Omit<SchemaGeneratorOptions, 'count'> & { count: number },
): Promise<Result<void, GenerateFileError>> => {
	const directoryCheck = checkDirectory(outputDir);
	if (!directoryCheck.success) {
		return directoryCheck;
	}

	const filePath = resolveOutputPath(outputDir, schema.name, format);
	const fileCheck = checkFileAbsent(filePath);
	if (!fileCheck.success) {
		return fileCheck;
	}

	const handle = await openDataFile(schema, filePath, format);
	try {
		for (const record of generateSchemaRecords(schema, options)) {
			const writeResult = await writeRecord(handle, record);
			if (!writeResult.success) {
				throw new Error(`Failed to write record: ${writeResult.data.error}`);
			}
		}
	} finally {
		await closeDataFile(handle);
	}

	return success(undefined);
};

/**
 * Generates records for all schemas in `dictionary` with a non-zero count and writes each to a
 * separate file in `outputDir`, named `<schema.name>.<format>`.
 *
 * All output file paths are checked before any writing begins. Fails without writing any files
 * if the directory does not exist or if any expected output file already exists.
 */
export const generateDictionaryFiles = async (
	dictionary: Dictionary,
	outputDir: string,
	format: DataFileFormat,
	options: DictionaryGeneratorOptions,
): Promise<Result<void, GenerateFileError>> => {
	const directoryCheck = checkDirectory(outputDir);
	if (!directoryCheck.success) {
		return directoryCheck;
	}

	const includedSchemaNames = Object.entries(options.counts)
		.filter(([, count]) => count > 0)
		.map(([name]) => name);

	for (const schemaName of includedSchemaNames) {
		const filePath = resolveOutputPath(outputDir, schemaName, format);
		const fileCheck = checkFileAbsent(filePath);
		if (!fileCheck.success) {
			return fileCheck;
		}
	}

	const schemaByName = new Map(dictionary.schemas.map((schema) => [schema.name, schema]));
	const handles = new Map<string, Awaited<ReturnType<typeof openDataFile>>>();

	for (const schemaName of includedSchemaNames) {
		const schema = schemaByName.get(schemaName);
		if (schema === undefined) {
			continue;
		}
		const filePath = resolveOutputPath(outputDir, schemaName, format);
		handles.set(schemaName, await openDataFile(schema, filePath, format));
	}

	try {
		for (const { schemaName, record } of generateDictionaryRecords(dictionary, options)) {
			const handle = handles.get(schemaName);
			if (handle !== undefined) {
				const writeResult = await writeRecord(handle, record);
				if (!writeResult.success) {
					throw new Error(`Failed to write record for schema '${schemaName}': ${writeResult.data.error}`);
				}
			}
		}
	} finally {
		for (const handle of handles.values()) {
			await closeDataFile(handle);
		}
	}

	return success(undefined);
};

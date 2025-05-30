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

import { z } from 'zod';
import { Schema } from './metaSchema/index';

export const separatedValueFileTypeSchema = z.enum(['tsv', 'csv']);
export type SeparatedValueFileType = z.infer<typeof separatedValueFileTypeSchema>;

export type DataFileTemplateConfig = { delimiter: string; extension: string };

const SeparatedValueFileConfigs = {
	csv: { delimiter: ',', extension: 'csv' },
	tsv: { delimiter: '\t', extension: 'tsv' },
} as const satisfies Record<SeparatedValueFileType, DataFileTemplateConfig>;

export type CreateDataFileTemplateOptions = { fileType: SeparatedValueFileType } | DataFileTemplateConfig;
export type DataFileTemplate = { fileName: string; content: string };

/**
 * Create the contents of a file that can be used to store data that will be validated with the provided Schema.
 * The file will be a separated values file with a header row. The headers correspond to the fields in the schema.
 * An empty row with placeholder delimiters for each field is also included. Also returned is the lectern standard
 * filename for the file, which will use the schema name.
 *
 * By default this file will be a tab separated value file (`.tsv`). If an options object is provided, you can
 * either specify the `fileType` as `tsv` or `csv`. Selecting `csv` will provide a comma separated value file
 * (`.csv`) instead.
 *
 * If you do not specify a file type, the options also you to directly specify the file extension and delimiter value
 * that is used.
 *
 * @param schema
 * @param options - `{ fileType: 'csv' | 'tsv' }` OR `{ delimiter: string; extension: string; } `
 * - default if not provided will use 'tsv'
 * @returns
 */
export function createDataFileTemplate(schema: Schema, options?: CreateDataFileTemplateOptions): DataFileTemplate {
	const config = !options
		? SeparatedValueFileConfigs.tsv
		: 'fileType' in options
			? SeparatedValueFileConfigs[options.fileType]
			: options;

	// Build header row from field names
	const header = schema.fields.map((field) => field.name);

	// Build a single empty data row (just placeholders)
	const dataRow = schema.fields.map(() => '');

	// Join header and row into TSV string
	const lines = [header.join(config.delimiter), dataRow.join(config.delimiter)];

	const content = lines.join('\n') + '\n';

	return {
		fileName: `${schema.name}.${config.extension}`,
		content,
	};
}

/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
/** @jsxImportSource @emotion/react */

import type { Schema, Values } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { SchemaRelationshipDiagram } from '../../src/viewer-diagram/SchemaRelationshipDiagram';

import biosampleDictionary from '../fixtures/minimalBiosampleModel';
import websiteUserDictionary from '../fixtures/websiteUsersDataDictionary';

const meta = {
	component: SchemaRelationshipDiagram,
	title: 'Viewer - Diagram/Schema Relationship Diagram',
	tags: ['autodocs'],

	render: (args) => (
		<div
			style={{
				height: '40vh',
			}}
		>
			<SchemaRelationshipDiagram {...args} />
		</div>
	),
} satisfies Meta<typeof SchemaRelationshipDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BiosampleDictionary: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { dictionary: biosampleDictionary, layout: { columnWidth: 600, maxColumns: 4, rowHeight: 500 } },
};
export const TwoColumns: Story = {
	// args: { name: sampleDictionary.name, version: sampleDictionary.name, description: sampleDictionary.description },
	args: { dictionary: biosampleDictionary, layout: { columnWidth: 600, maxColumns: 2, rowHeight: 500 } },
};

export const WebsiteUserDictionary: Story = {
	args: { dictionary: websiteUserDictionary },
};

type X = { a: string };

export const SeparatedValueFileTypes = {
	tsv: 'tsv',
	csv: 'csv',
} as const;
export type SeparatedValueFileType = Values<typeof SeparatedValueFileTypes>;

export type DataFileTemplateConfig = { delimiter: string; extension: string };

const SeparatedValueFileConfigs = {
	csv: { delimiter: ',', extension: 'csv' },
	tsv: { delimiter: '\t', extension: 'tsv' },
} as const satisfies Record<SeparatedValueFileType, DataFileTemplateConfig>;

export type CreateDataFileTemplateOptions = { fileType: SeparatedValueFileType } | DataFileTemplateConfig;
export type DataFileTemplate = { fileName: string; content: string };

export function createDataFileTemplate(schema: Schema, options?: CreateDataFileTemplateOptions): DataFileTemplate {
	const config =
		!options ? SeparatedValueFileConfigs.tsv
		: 'fileType' in options ? SeparatedValueFileConfigs[options.fileType]
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

const x: CreateDataFileTemplateOptions = { fileType: 'csv', delimiter: 'asdf', extension: 'asf' };

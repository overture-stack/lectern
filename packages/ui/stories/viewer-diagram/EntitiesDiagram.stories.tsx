/** @jsxImportSource @emotion/react */

import type { Schema, Values } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import { EntitiesDiagram } from '../../src/viewer-diagram/EntitiesDiagram';

import biosampleDictionary from '../fixtures/minimalBiosampleModel';
import websiteUserDictionary from '../fixtures/websiteUsersDataDictionary';

const meta = {
	component: EntitiesDiagram,
	title: 'Viewer - Diagram/Entities Diagram',
	tags: ['autodocs'],

	render: (args) => (
		<div
			style={{
				height: '40vh',
			}}
		>
			<EntitiesDiagram {...args} />
		</div>
	),
} satisfies Meta<typeof EntitiesDiagram>;

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

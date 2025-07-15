/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable/SchemaTable';
import Advanced from '../fixtures/TorontoMapleLeafs.json';
import PCGL from '../fixtures/pcgl.json';
import themeDecorator from '../themeDecorator';

const torontoMapleLeafsDictionary: Dictionary = replaceReferences(Advanced as Dictionary);
const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);

const meta = {
	component: SchemaTable,
	title: 'Viewer - Table/Schema Table',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof SchemaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[0] },
};

export const PlayerProfiles: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[1] },
};

export const GameEvents: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[2] },
};

export const AdvancedStats: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[3] },
};

export const EdgeCases: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[4] },
};

export const PCGLParticipant: Story = {
	args: { schema: pcglDictionary.schemas[0] },
};

export const PCGLSociodemographic: Story = {
	args: { schema: pcglDictionary.schemas[1] },
};

export const PCGLDemographic: Story = {
	args: { schema: pcglDictionary.schemas[2] },
};

export const PCGLDiagnosis: Story = {
	args: { schema: pcglDictionary.schemas[3] },
};

export const PCGLTreatment: Story = {
	args: { schema: pcglDictionary.schemas[4] },
};

export const PCGLFollowUp: Story = {
	args: { schema: pcglDictionary.schemas[5] },
};

export const PCGLProcedure: Story = {
	args: { schema: pcglDictionary.schemas[6] },
};

export const PCGLMedication: Story = {
	args: { schema: pcglDictionary.schemas[7] },
};

export const PCGLRadiation: Story = {
	args: { schema: pcglDictionary.schemas[8] },
};

export const PCGLMeasurement: Story = {
	args: { schema: pcglDictionary.schemas[9] },
};

export const PCGLPhenotype: Story = {
	args: { schema: pcglDictionary.schemas[10] },
};

export const PCGLComorbidity: Story = {
	args: { schema: pcglDictionary.schemas[11] },
};

export const PCGLExposure: Story = {
	args: { schema: pcglDictionary.schemas[12] },
};

export const PCGLSpecimen: Story = {
	args: { schema: pcglDictionary.schemas[13] },
};

export const PCGLSample: Story = {
	args: { schema: pcglDictionary.schemas[14] },
};

export const PCGLExperiment: Story = {
	args: { schema: pcglDictionary.schemas[15] },
};

export const PCGLReadGroup: Story = {
	args: { schema: pcglDictionary.schemas[16] },
};

export const MultiForeignKeys: Story = {
	args: { schema: torontoMapleLeafsDictionary.schemas[10] },
};

/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';
import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable/SchemaTable';
import EntityRelationshipExamples from '../fixtures/entityRelationshipExamples.json';
import PCGL from '../fixtures/pcgl.json';
import themeDecorator from '../themeDecorator';

const entityRelationshipDictionary: Dictionary = replaceReferences(EntityRelationshipExamples as Dictionary);
const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);

const meta = {
	component: SchemaTable,
	title: 'Viewer - Table/Schema Table',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof SchemaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicUniqueKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[0] },
};

export const CombinationKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[1] },
};

export const ManyToOneForeignKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[2] },
};

export const OneToOneForeignKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[3] },
};

export const CompoundForeignKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[5] },
};

export const MultipleForeignKeyMappings: Story = {
	args: { schema: entityRelationshipDictionary.schemas[7] },
};

export const ComplexAnalysis: Story = {
	args: { schema: entityRelationshipDictionary.schemas[8] },
};

export const RangeRestrictions: Story = {
	args: { schema: entityRelationshipDictionary.schemas[9] },
};

export const ArrayCountRestrictions: Story = {
	args: { schema: entityRelationshipDictionary.schemas[10] },
};

export const ConditionalLogic: Story = {
	args: { schema: entityRelationshipDictionary.schemas[11] },
};

export const DataTypesShowcase: Story = {
	args: { schema: entityRelationshipDictionary.schemas[12] },
};

export const RegexPatterns: Story = {
	args: { schema: entityRelationshipDictionary.schemas[13] },
};

export const BasicCodelists: Story = {
	args: { schema: entityRelationshipDictionary.schemas[14] },
};

export const PCGLParticipant: Story = {
	args: { schema: pcglDictionary.schemas[0] },
};

export const PCGLDiagnosis: Story = {
	args: { schema: pcglDictionary.schemas[3] },
};

export const PCGLSpecimen: Story = {
	args: { schema: pcglDictionary.schemas[13] },
};

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

import { type Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable/index';
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

export const RangeCombinationsComprehensive: Story = {
	args: { schema: entityRelationshipDictionary.schemas[15] },
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

export const PCGLFollowup: Story = {
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

export const PCGLExposure: Story = {
	args: { schema: pcglDictionary.schemas[11] },
};

export const PCGLSpecimen: Story = {
	args: { schema: pcglDictionary.schemas[12] },
};

export const PCGLSample: Story = {
	args: { schema: pcglDictionary.schemas[13] },
};

export const PCGLExperiment: Story = {
	args: { schema: pcglDictionary.schemas[14] },
};

export const PCGLReadGroup: Story = {
	args: { schema: pcglDictionary.schemas[15] },
};

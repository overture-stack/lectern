/*
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
 */

import { type Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import SchemaTable from '../../src/viewer-table/DataTable/SchemaTable/index';
import EntityRelationshipExamples from '../fixtures/entityRelationshipExamples.json';
import themeDecorator from '../themeDecorator';

const entityRelationshipDictionary: Dictionary = replaceReferences(EntityRelationshipExamples as Dictionary);

const meta = {
	component: SchemaTable,
	title: 'Viewer - Table/Allowed Values Column',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		docs: {
			description: {
				component:
					'Demonstrates how the Allowed Values column renders foreign key and unique key constraints for fields.',
			},
		},
	},
} satisfies Meta<typeof SchemaTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Schema: `sequencing_many_to_one`
 * Field of interest: `participant_id`
 * - Has a single foreign key reference to the `participant` schema's `participant_id` field.
 * - Multiple sequencing records may reference the same participant (many-to-one).
 */
export const SingleForeignKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[2] },
};

/**
 * Schema: `sequencing_one_to_one`
 * Field of interest: `participant_id`
 * - Has a single foreign key reference to the `participant` schema's `participant_id` field.
 * - Also the sole uniqueKey for this schema, so each record references a distinct participant (one-to-one).
 * - Both the foreign key description and the unique key description render independently.
 */
export const ForeignKeyAndUniqueKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[3] },
};

/**
 * Schema: `lab_result`
 * Fields of interest: `participant_id` and `timepoint`
 * - Both fields are part of a single compound foreign key referencing the `sample_collection` schema.
 * - Together they form the compound reference; neither field alone is sufficient to identify the referenced record.
 */
export const CompoundForeignKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[5] },
};

/**
 * Schema: `complex_analysis`
 * Field of interest: `participant_id`
 * - Appears in two separate foreign key restrictions: one referencing `sample_collection`, one referencing
 *   `sequencing_many_to_one`. The Allowed Values column must show each schema and its corresponding foreign field.
 */
export const MultipleForeignKeys: Story = {
	args: { schema: entityRelationshipDictionary.schemas[8] },
};

/**
 * Schema: `participant`
 * Field of interest: `participant_id`
 * - Is the sole entry in the schema's uniqueKey — it uniquely identifies each record.
 * - No foreign key constraint.
 */
export const BasicUniqueKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[0] },
};

/**
 * Schema: `unique_keys`
 * Fields of interest: `firstName` and `lastName`
 * - Both fields are part of a compound uniqueKey. Neither is unique alone; together they must be unique per record.
 * - No foreign key constraints.
 */
export const CompoundUniqueKey: Story = {
	args: { schema: entityRelationshipDictionary.schemas[1] },
};

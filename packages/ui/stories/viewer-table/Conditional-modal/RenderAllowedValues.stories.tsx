/* Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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

/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import RenderAllowedValues from '../../../src/viewer-table/ConditionalLogicModal/RenderAllowedValues';
import pcgl from '../../fixtures/pcgl.json';
import themeDecorator from '../../themeDecorator';

const pcglDictionary: Dictionary = replaceReferences(pcgl as Dictionary);

const meta = {
	component: RenderAllowedValues,
	title: 'Viewer Table/Conditional Modal/Render Allowed Values',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof RenderAllowedValues>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Required: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[0], // submitter_participant_id field
		restrictions: {
			required: true,
		},
	},
};

export const RegularExpressionSingle: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[2].fields[0], // submitter_diagnosis_id field
		restrictions: {
			regex: '^[A-Za-z0-9\\-\\._]{1,64}$',
		},
	},
};

export const RegularExpressionMultiple: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[2], // disease_specific_modifier field
		restrictions: {
			regex: ['^MONDO:\\d{7}$', '^[A-Z]{2,4}-\\d{4}$', '^[a-z]+@[a-z]+\\.[a-z]{2,3}$'],
		},
	},
};

export const CodeListStrings: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[4], // duo_permission field
		restrictions: {
			codeList: [
				'DUO:0000042 (general research use)',
				'DUO:0000006 (health or medical or biomedical research)',
				'DUO:0000007 (disease specific research)',
				'DUO:0000011 (population origins or ancestry research only)',
				'DUO:0000004 (no restriction)',
			],
		},
	},
};

export const CodeListNumbers: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[2], // age_at_sociodem_collection field
		restrictions: {
			codeList: [0, 365, 730, 1095, 1460, 1825, 2190, 2555, 2920, 3285],
		},
	},
};

export const CodeListLargeSet: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[3], // education field
		restrictions: {
			codeList: [
				'No formal education',
				'Elementary school or equivalent',
				'High school (secondary school) diploma or equivalency certificate',
				'College, CEGEP, or other non-university certificate or diploma',
				"Bachelor's degree",
				'Degree in medicine, dentistry, veterinary medicine or optometry',
				"Master's degree",
				'Doctoral degree',
				'Post-doctoral fellowship or training',
				'Prefer not to answer',
				'Not applicable',
				'Missing - Unknown',
				'Missing - Not collected',
				'Missing - Not provided',
				'Missing - Restricted access',
			],
		},
	},
};

export const EmptyAllowed: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[2], // disease_specific_modifier field
		restrictions: {
			empty: true,
		},
	},
};

export const MultipleRestrictions: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[0].fields[0], // submitter_participant_id field
		restrictions: {
			required: true,
			regex: '^[A-Za-z0-9\\-\\._]{1,64}$',
		},
	},
};

export const NoRestrictions: Story = {
	args: {
		currentSchemaField: pcglDictionary.schemas[1].fields[1], // submitter_participant_id in sociodemographic
		restrictions: {},
	},
};

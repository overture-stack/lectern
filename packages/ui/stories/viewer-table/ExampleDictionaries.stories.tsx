/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import type { Meta, StoryObj } from '@storybook/react';

import { DictionaryTableViewer } from '../../src/viewer-table/DictionaryTableViewer';
import { type DictionaryTestData, withDictionaryContext } from '../dictionaryDecorator';
import ArgoDictionary from '../fixtures/argo.json';
import PcglDictionary from '../fixtures/pcgl.json';
import themeDecorator from '../themeDecorator';

/*
 * Header text as shown in the Dictionary Viewer manuscript. Only the name and description
 * displayed above the toolbar change; schemas and fields are rendered as stored.
 */
const pcgl = {
	...PcglDictionary,
	name: 'Pan-Canadian Genome Library Clinical Dictionary',
	description:
		'Clinical data dictionary for the Pan-Canadian Genome Library (PCGL). Defines 17 interrelated schemas and their fields, code lists, and validation rules for harmonized clinical and molecular data: participant registration, sociodemographics and demographics, diagnoses, treatments (medication, radiation, procedures), follow-up, phenotypes, measurements, comorbidities, exposures, specimens, samples, and sequencing experiments with their read groups.',
};
const argo = { ...ArgoDictionary, description: ArgoDictionary.description.replace(/\s*—\s*/g, ': ') };

const meta = {
	component: DictionaryTableViewer,
	title: 'Viewer - Table/Example Dictionaries',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The same viewer rendering two real clinical data dictionaries, the PCGL and ICGC-ARGO examples shown in the Dictionary Viewer manuscript. The ARGO example adds a custom column and a metadata filter through props alone.',
			},
			story: {
				inline: false,
				iframeHeight: 600,
			},
		},
	},
} satisfies Meta<typeof DictionaryTableViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Pan-Canadian Genome Library clinical dictionary (`prod_pcgl_schema` 1.1): 17 schemas,
 * 136 fields. The default viewer with no extra configuration.
 */
export const Pcgl: Story = {
	decorators: [withDictionaryContext([pcgl] as DictionaryTestData)],
};

/**
 * ICGC-ARGO data dictionary release 1.32, converted to Lectern format: 15 schemas, 245
 * fields. Adds a column for each field's `meta.tier` and a filter over each schema's
 * `meta.category`.
 */
export const Argo: Story = {
	decorators: [withDictionaryContext([argo] as DictionaryTestData)],
	args: {
		filterDropdowns: [{ label: 'Clinical domain', filterProperty: 'meta.category' }],
		customColumns: [{ columnHeader: 'ARGO tier', metaPath: 'meta.tier' }],
	},
};

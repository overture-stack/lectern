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

import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { DictionaryTableViewer } from '../../../src/viewer-table/DictionaryTableViewer';

import { withFilterDictionary, withMultipleDictionaries } from '../../dictionaryDecorator';
import themeDecorator from '../../themeDecorator';

const withFixedHeight: Decorator = (Story) => (
	<div style={{ height: '600px', overflow: 'auto' }}>
		<Story />
	</div>
);

const meta = {
	component: DictionaryTableViewer,
	title: 'Viewer - Table/Toolbar/Filter Dropdowns',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Stories demonstrating the optional filter dropdown feature, which allows schemas to be filtered by metadata properties.',
			},
			story: {
				autoplay: false,
				inline: false,
				iframeHeight: 600,
			},
		},
	},
} satisfies Meta<typeof DictionaryTableViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with two filter categories configured.
 */
export const Default: Story = {
	decorators: [withFilterDictionary],
	args: {
		filterDropdowns: [
			{ label: 'Submitter', filterProperty: 'meta.submitter' },
			{ label: 'Domain', filterProperty: 'meta.domain' },
		],
	},
};

/**
 * A single filter category configured. The toolbar button displays the
 * filter label directly instead of a generic "Filters" label.
 */
export const SingleFilter: Story = {
	decorators: [withFilterDictionary],
	args: {
		filterDropdowns: [{ label: 'Submitter', filterProperty: 'meta.submitter' }],
	},
};

/**
 * Selects Submitter: "Clinician" to show only matching schemas.
 * Navigate to the canvas tab to see a live demo.
 */
export const FilterSelected: Story = {
	decorators: [withFixedHeight, withFilterDictionary],
	args: {
		filterDropdowns: [
			{ label: 'Submitter', filterProperty: 'meta.submitter' },
			{ label: 'Domain', filterProperty: 'meta.domain' },
		],
	},
	parameters: {
		docs: {
			story: {
				inline: true,
				autoplay: false,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const filtersButton = await canvas.findByRole('button', { name: 'Filters' });
		await userEvent.click(filtersButton);
		const clinicianCheckbox = await canvas.findByLabelText('Clinician');
		await userEvent.click(clinicianCheckbox);
	},
};

/**
 * Selects Submitter: "Researcher" and Domain: "Health" and shows the empty state,
 * navigate to the canvas tab to see a live demo.
 */
export const EmptyState: Story = {
	decorators: [withFixedHeight, withFilterDictionary],
	args: {
		filterDropdowns: [
			{ label: 'Submitter', filterProperty: 'meta.submitter' },
			{ label: 'Domain', filterProperty: 'meta.domain' },
		],
	},
	parameters: {
		docs: {
			story: {
				inline: true,
				autoplay: false,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const filtersButton = await canvas.findByRole('button', { name: 'Filters' });
		await userEvent.click(filtersButton);
		const researcherCheckbox = await canvas.findByLabelText('Researcher');
		await userEvent.click(researcherCheckbox);
		const healthCheckbox = await canvas.findByLabelText('Health');
		await userEvent.click(healthCheckbox);
	},
};

/**
 * No filterDropdowns configured, the component renders without any
 * filter controls.
 */
export const NoConfig: Story = {
	decorators: [withMultipleDictionaries],
};

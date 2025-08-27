/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

import type { Meta, StoryObj } from '@storybook/react';

import VersionSwitcher from '../../../src/viewer-table/Toolbar/DictionaryVersionSwitcher';

import {
	withEmptyDictionaries,
	withLoadingState,
	withMultipleDictionaries,
	withSingleDictionary,
} from '../../dictionaryDecorator';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: VersionSwitcher,
	title: 'Viewer - Table/Toolbar/Dictionary Version Switcher',
	tags: ['autodocs'],
} satisfies Meta<typeof VersionSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultipleVersions: Story = {
	decorators: [themeDecorator(), withMultipleDictionaries],
	parameters: {
		docs: {
			description: {
				story: 'Shows the version switcher with multiple dictionary versions available.',
			},
		},
	},
};

export const SingleVersion: Story = {
	decorators: [themeDecorator(), withSingleDictionary],
	parameters: {
		docs: {
			description: {
				story: 'With only one version, the component will not render (by design).',
			},
		},
	},
};

export const EmptyState: Story = {
	decorators: [themeDecorator(), withEmptyDictionaries],
	parameters: {
		docs: {
			description: {
				story: 'With no dictionaries, the component will not render.',
			},
		},
	},
};

export const Loading: Story = {
	decorators: [themeDecorator(), withLoadingState()],
	parameters: {
		docs: {
			description: {
				story: 'Component is disabled when loading.',
			},
		},
	},
};

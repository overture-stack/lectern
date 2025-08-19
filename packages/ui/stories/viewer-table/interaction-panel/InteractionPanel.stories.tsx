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

import type { Meta, StoryObj } from '@storybook/react';

import { InteractionPanelSkeleton } from '../../../src/viewer-table/Loading';
import InteractionPanel from '../../../src/viewer-table/InteractionPanel/InteractionPanel';
import { withDictionaryContext } from '../../dictionaryDecorator';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: InteractionPanel,
	title: 'Viewer - Table/Interaction - Panel/InteractionPanel',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof InteractionPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockProps = {
	setIsCollapsed: (isCollapsed: boolean) => {
		alert('setIsCollapsed called with:' + isCollapsed);
	},
	onSelect: (schemaNameIndex: number) => {
		alert('onSelect called with schemaNameIndex:' + schemaNameIndex);
	},
};

export const Default: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	args: {
		...mockProps,
	},
};

export const WithSingleVersion: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	args: {
		...mockProps,
	},
};

export const Collapsed: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	args: {
		...mockProps,
	},
};

export const Loading: Story = {
	decorators: [themeDecorator()],
	args: {
		...mockProps,
	},
	render: () => <InteractionPanelSkeleton />,
	parameters: {
		docs: {
			description: {
				story:
					'Interactive panel displays skeleton placeholders for table controls, version switcher, and download buttons during data loading.',
			},
		},
	},
};

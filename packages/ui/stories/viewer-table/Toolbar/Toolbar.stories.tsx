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
import { useState } from 'react';

import Toolbar from '../../../src/viewer-table/Toolbar/index';
import { ToolbarSkeleton } from '../../../src/viewer-table/Loading';

import { withDictionaryContext } from '../../dictionaryDecorator';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: Toolbar,
	title: 'Viewer - Table/Toolbar/Toolbar',
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The Toolbar provides controls for dictionary navigation, version switching, filtering, and data export functionality.',
			},
		},
	},
} satisfies Meta<typeof Toolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveToolbar = () => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const handleSelect = (schemaNameIndex: number) => {
		console.log('Selected schema index:', schemaNameIndex);
	};

	return <Toolbar onSelect={handleSelect} setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />;
};

export const Default: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	render: () => <InteractiveToolbar />,
	parameters: {
		docs: {
			description: {
				story:
					'Click the expand/collapse button to see it toggle between "Expand All" and "Collapse All" states. Check the console for action logs.',
			},
		},
	},
};

export const WithSingleVersion: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	render: () => <InteractiveToolbar />,
};

export const ShowingExpandButton: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	args: {
		onSelect: (schemaNameIndex: number) => console.log('Selected schema index:', schemaNameIndex),
		setIsCollapsed: (isCollapsed: boolean) => console.log('setIsCollapsed called with:', isCollapsed),
		isCollapsed: true,
	},
};

export const ShowingCollapseButton: Story = {
	decorators: [themeDecorator(), withDictionaryContext()],
	args: {
		onSelect: (schemaNameIndex: number) => console.log('Selected schema index:', schemaNameIndex),
		setIsCollapsed: (isCollapsed: boolean) => console.log('setIsCollapsed called with:', isCollapsed),
		isCollapsed: false,
	},
};

export const Loading: Story = {
	decorators: [themeDecorator()],
	render: () => <ToolbarSkeleton />,
	parameters: {
		docs: {
			description: {
				story:
					'Interactive panel displays skeleton placeholders for table controls, version switcher, and download buttons during data loading.',
			},
		},
	},
};

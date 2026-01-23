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

import { DictionaryTableViewer } from '../../src/viewer-table/DictionaryTableViewer';
import { withMultipleDictionaries } from '../dictionaryDecorator';
import themeDecorator from '../themeDecorator';

const meta = {
	component: DictionaryTableViewer,
	title: 'Viewer - Table/Viewport Testing',
	decorators: [themeDecorator(), withMultipleDictionaries],
	parameters: {
		layout: 'padded-fullscreen',
		padding: 64,
		docs: { disable: true }, // Hide from docs, this is for manual testing
	},
} satisfies Meta<typeof DictionaryTableViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default - use Storybook viewport toolbar to resize
export const Default: Story = {};

// Pre-configured viewport sizes
export const Mobile: Story = {
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
	},
};

export const MobileLarge: Story = {
	parameters: {
		viewport: { defaultViewport: 'mobile2' },
	},
};

export const Tablet: Story = {
	parameters: {
		viewport: { defaultViewport: 'tablet' },
	},
};

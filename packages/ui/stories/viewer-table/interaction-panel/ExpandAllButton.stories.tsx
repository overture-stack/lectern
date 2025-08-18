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

import ExpandAllButton from '../../../src/viewer-table/InteractionPanel/ExpandAllButton';
import {
	withErrorState,
	withForeverLoading,
	withLoadingState,
	withMultipleDictionaries,
} from '../../dictionaryDecorator';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: ExpandAllButton,
	title: 'Viewer - Table/Interaction - Panel/ExpandAllButton',
	tags: ['autodocs'],
	decorators: [themeDecorator(), withMultipleDictionaries],
} satisfies Meta<typeof ExpandAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { onClick: () => alert('All collapsible components are expanded') },
};

export const Loading: Story = {
	decorators: [themeDecorator(), withLoadingState()],
	args: { onClick: () => alert('All collapsible components are expanded') },
};

export const ForeverLoading: Story = {
	decorators: [themeDecorator(), withForeverLoading()],
	args: { onClick: () => alert('All collapsible components are expanded') },
};

export const Error: Story = {
	decorators: [themeDecorator(), withErrorState()],
	args: { onClick: () => alert('All collapsible components are expanded') },
};

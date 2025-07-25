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

import { DictionaryServerRecord } from '@overture-stack/lectern-client/dist/rest';
import type { Meta, StoryObj } from '@storybook/react';

import VersionSwitcher, {
	DictionaryServerUnion,
} from '../../../src/viewer-table/InteractionPanel/DictionaryVersionSwitcher';

import DictionarySample from '../../fixtures/pcgl.json';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: VersionSwitcher,
	title: 'Viewer - Table/Interaction - Panel/Dictionary Version Switcher',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof VersionSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const SingleDictionaryData: DictionaryServerUnion[] = [DictionarySample as DictionaryServerUnion];
const MultipleDictionaryData: DictionaryServerUnion[] = [
	{ ...DictionarySample, _id: '1', version: '1.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
	{ ...DictionarySample, _id: '2', version: '2.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
	{ ...DictionarySample, _id: '3', version: '3.0', createdAt: '2025-01-01' } as DictionaryServerRecord,
];

const mockProps = {
	dictionaryData: MultipleDictionaryData,
	dictionaryIndex: 0,
	onVersionChange: (index: number) => alert(`Version changed to index: ${index}`),
};

export const MultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
		title: 'Multiple Versions',
	},
};

export const SingleVersion: Story = {
	args: {
		...mockProps,
		dictionaryData: SingleDictionaryData,
		title: 'Single Version',
	},
};

export const EmptyArray: Story = {
	args: {
		...mockProps,
		dictionaryData: [],
		title: 'Empty Array',
	},
};

export const DisabledWithMultipleVersions: Story = {
	args: {
		...mockProps,
		dictionaryData: MultipleDictionaryData,
		disabled: true,
		title: 'Disabled with Multiple Versions',
	},
};

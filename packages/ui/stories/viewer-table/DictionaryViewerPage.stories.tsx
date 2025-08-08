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

/** @jsxImportSource @emotion/react */

import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';
import type { Meta, StoryObj } from '@storybook/react';

import { DictionaryDataProvider } from '../../src/dictionary-controller/DictionaryDataContext';
import { DictionaryTableViewer } from '../../src/viewer-table/DictionaryViewer';
import EntityRelationshipExamples from '../fixtures/entityRelationshipExamples.json';
import ExampleLectern from '../fixtures/example_lectern.json';
import PCGL from '../fixtures/pcgl.json';
import themeDecorator from '../themeDecorator';

const entityRelationshipDictionary: Dictionary = replaceReferences(EntityRelationshipExamples as Dictionary);
const exampleLecternDictionary: Dictionary = replaceReferences(ExampleLectern as Dictionary);
const pcglDictionary: Dictionary = replaceReferences(PCGL as Dictionary);

const mockDictionaries = [
	{
		...entityRelationshipDictionary,
		_id: '1',
		createdAt: '2025-01-15',
	},
	{
		...exampleLecternDictionary,
		_id: '2',
		createdAt: '2025-01-14',
	},
	{
		...pcglDictionary,
		_id: '3',
		createdAt: '2025-01-13',
	},
];

const meta = {
	component: DictionaryTableViewer,
	title: 'Viewer - Table/Dictionary Viewer Page',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DictionaryTableViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStaticData: Story = {
	render: () => (
		<DictionaryDataProvider staticDictionaries={mockDictionaries}>
			<DictionaryTableViewer />
		</DictionaryDataProvider>
	),
};

export const SingleDictionary: Story = {
	render: () => (
		<DictionaryDataProvider staticDictionaries={[mockDictionaries[0]]}>
			<DictionaryTableViewer />
		</DictionaryDataProvider>
	),
};

export const LoadingState: Story = {
	render: () => (
		<DictionaryDataProvider lecternUrl="http://fake-url" dictionaryName="fake-dictionary">
			<DictionaryTableViewer />
		</DictionaryDataProvider>
	),
};

export const LecternServer: Story = {
	render: () => (
		<DictionaryDataProvider lecternUrl="http://localhost:3031" dictionaryName="example-dictionary">
			<DictionaryTableViewer />
		</DictionaryDataProvider>
	),
};
export const EmptyState: Story = {
	render: () => (
		<DictionaryDataProvider staticDictionaries={[]}>
			<DictionaryTableViewer />
		</DictionaryDataProvider>
	),
};

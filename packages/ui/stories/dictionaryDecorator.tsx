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

import type { DictionaryServerRecord } from '@overture-stack/lectern-client/dist/rest';
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import type { Decorator } from '@storybook/react';
import React from 'react';

import { DictionaryDataProvider } from '../src/dictionary-controller/DictionaryDataContext';
import DictionarySample from './fixtures/pcgl.json';

type DictionaryServerUnion = Partial<DictionaryServerRecord> | Dictionary;

export type DictionaryTestData = Array<DictionaryServerUnion>;

export const singleDictionaryData: DictionaryTestData = [DictionarySample as DictionaryServerUnion];

export const multipleDictionaryData: DictionaryTestData = [
	{
		...DictionarySample,
		version: '1.0',
		_id: '1',
		createdAt: '2025-01-01T00:00:00.000Z',
	},
	{
		...DictionarySample,
		version: '2.0',
		_id: '2',
		createdAt: '2025-01-02T00:00:00.000Z',
	},
	{
		...DictionarySample,
		version: '3.0',
		_id: '3',
		createdAt: '2025-01-03T00:00:00.000Z',
	},
] as DictionaryServerRecord[];

export const emptyDictionaryData: DictionaryTestData = [];

export const withDictionaryContext = (dictionaries: DictionaryTestData = multipleDictionaryData): Decorator => {
	return (Story, context) => (
		<DictionaryDataProvider staticDictionaries={dictionaries}>
			<Story {...context} />
		</DictionaryDataProvider>
	);
};

export const withLecternUrl = (): Decorator => {
	return (Story, context) => (
		<DictionaryDataProvider lecternUrl="http://localhost:3031" staticDictionaries={multipleDictionaryData}>
			<Story {...context} />
		</DictionaryDataProvider>
	);
};

export const withLoadingState = (): Decorator => {
	return (Story, context) => (
		<DictionaryDataProvider lecternUrl="http://localhost:3031" dictionaryName={DictionarySample.name}>
			<Story {...context} />
		</DictionaryDataProvider>
	);
};

export const withErrorState = (): Decorator => {
	return (Story, context) => (
		<DictionaryDataProvider lecternUrl="http://nonexistent-server.com" dictionaryName="nonexistent">
			<Story {...context} />
		</DictionaryDataProvider>
	);
};

export const withMultipleDictionaries = withDictionaryContext(multipleDictionaryData);
export const withSingleDictionary = withDictionaryContext(singleDictionaryData);
export const withEmptyDictionaries = withDictionaryContext(emptyDictionaryData);

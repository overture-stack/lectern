/* Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

import type { DictionaryServerRecord, DictionarySummary } from '@overture-stack/lectern-client/dist/rest';
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { fetchAndValidateHostedDictionaries, fetchRemoteDictionary } from './sources';

export type DictionaryServerUnion = Partial<DictionaryServerRecord> | Dictionary;

export type FilterOptions = 'Required' | 'All Fields';

export type DictionaryContextType = {
	dictionaries?: DictionaryServerUnion[];
	versions?: DictionarySummary[];
	lecternUrl?: string;
	name?: string;
	loading: boolean;
	error?: boolean;
	currentDictionaryIndex: number;
	filters: FilterOptions[];
	setCurrentDictionaryIndex: (index: number) => void;
	setFilters: (filters: FilterOptions[]) => void;
};

export type StaticDictionaryProviderProps = {
	children: ReactNode;
	staticDictionaries: DictionaryServerUnion[];
};

export type RemoteDictionaryProviderProps = {
	children: ReactNode;
	lecternUrl: string;
	dictionaryName: string;
};

export type HostedDictionaryProviderProps = {
	children: ReactNode;
	hostedUrl: string;
};

export type DictionaryProviderProps =
	| StaticDictionaryProviderProps
	| RemoteDictionaryProviderProps
	| HostedDictionaryProviderProps;

const DictionaryDataContext = createContext<DictionaryContextType | undefined>(undefined);

export function useDictionaryDataContext(): DictionaryContextType {
	const context = useContext(DictionaryDataContext);
	if (context === undefined) {
		console.error('useDictionaryDataContext must be used within a DictionaryDataProvider');
		throw new Error('useDictionaryDataContext must be used within a DictionaryDataProvider');
	}
	return context;
}

export function DictionaryDataProvider(props: DictionaryProviderProps) {
	const [versions, setVersions] = useState<DictionarySummary[]>([]);
	const [dictionaries, setDictionaries] = useState<DictionaryServerUnion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const [currentDictionaryIndex, setCurrentDictionaryIndex] = useState(0);
	const [filters, setFilters] = useState<FilterOptions[]>([]);

	useEffect(() => {
		if ('staticDictionaries' in props) {
			setDictionaries(props.staticDictionaries);
			setLoading(false);
			setError(false);
			return;
		}

		if ('hostedUrl' in props) {
			const fetchHostedDictionaries = async () => {
				try {
					const dictionariesData = await fetchAndValidateHostedDictionaries(props.hostedUrl);
					setDictionaries(dictionariesData);
					setError(false);
				} catch (err) {
					console.error('Error loading hosted dictionary data:', err);
					setError(true);
				} finally {
					setLoading(false);
				}
			};
			fetchHostedDictionaries();
			return;
		}

		if ('lecternUrl' in props) {
			const fetchRemoteDictionaries = async () => {
				try {
					const { versions: fetchedVersions, dictionaries: fetchedDictionaries } = await fetchRemoteDictionary(
						props.lecternUrl,
						props.dictionaryName,
					);
					setVersions(fetchedVersions);
					setDictionaries(fetchedDictionaries);
					setError(false);
				} catch (err) {
					console.error('Error loading remote dictionary data:', err);
					setError(true);
				} finally {
					setLoading(false);
				}
			};
			fetchRemoteDictionaries();
			return;
		}
	}, [props]);

	const value: DictionaryContextType = {
		dictionaries,
		versions,
		lecternUrl: 'lecternUrl' in props ? props.lecternUrl : undefined,
		name: 'dictionaryName' in props ? props.dictionaryName : undefined,
		loading,
		error,
		currentDictionaryIndex,
		filters,
		setCurrentDictionaryIndex,
		setFilters,
	};

	return <DictionaryDataContext.Provider value={value}>{props.children}</DictionaryDataContext.Provider>;
}

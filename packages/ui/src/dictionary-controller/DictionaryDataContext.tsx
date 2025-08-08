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

import * as lectern from '@overture-stack/lectern-client';
import { DictionaryServerRecord, DictionarySummary } from '@overture-stack/lectern-client/dist/rest';
import { Dictionary } from '@overture-stack/lectern-dictionary';
import { ReactNode } from 'react';

import { createContext, useContext, useEffect, useState } from 'react';

export type DictionaryServerUnion = Partial<DictionaryServerRecord> | Dictionary;

export type FilterOptions = 'Required' | 'All Fields';

export type DictionaryContextType = {
	dictionaries: DictionaryServerUnion[] | undefined;
	versions: DictionarySummary[] | undefined;
	lecternUrl?: string;
	name?: string;
	loading: boolean;
	error?: boolean;
	currentDictionaryIndex: number;
	filters: FilterOptions[];
	setCurrentDictionaryIndex: (index: number) => void;
	setFilters: (filters: FilterOptions[]) => void;
	selectedDictionary: DictionaryServerUnion | undefined;
};

type StaticDictionaryProviderProps = {
	children: ReactNode;
	staticDictionaries: DictionaryServerUnion[];
};

type RemoteDictionaryProviderProps = {
	children: ReactNode;
	lecternUrl: string;
	dictionaryName: string;
};

export type DictionaryProviderProps = StaticDictionaryProviderProps | RemoteDictionaryProviderProps;

const DictionaryDataContext = createContext<DictionaryContextType | undefined>(undefined);

const fetchRemoteDictionary = async (lecternUrl: string, dictionaryName: string) => {
	try {
		const fetchedDictionaryVersions = await lectern.rest.listDictionaries(lecternUrl, { name: dictionaryName });
		if (!fetchedDictionaryVersions.success) {
			throw new Error('Failed to fetch dictionary versions');
		}

		const results = await Promise.all(
			fetchedDictionaryVersions.data.map((version) =>
				lectern.rest.getDictionary(lecternUrl, { name: version.name, version: version.version }),
			),
		);
		const dictionaries: DictionaryServerRecord[] = results.filter((res) => res.success).map((res) => res.data);

		return { versions: fetchedDictionaryVersions.data, dictionaries };
	} catch (err) {
		console.error('Error loading dictionary data:', err);
		return undefined;
	}
};

export function useDictionaryDataContext(): DictionaryContextType {
	const context = useContext(DictionaryDataContext);
	if (context === undefined) {
		console.error('useDictionaryDataContext must be used within a DictionaryDataProvider');
		throw new Error();
	}
	return context;
}

export function DictionaryDataProvider(props: DictionaryProviderProps) {
	const [versions, setVersions] = useState<DictionarySummary[] | undefined>(undefined);
	const [dictionaries, setDictionaries] = useState<DictionaryServerUnion[] | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);

	const [currentDictionaryIndex, setCurrentDictionaryIndex] = useState(0);
	const [filters, setFilters] = useState<FilterOptions[]>([]);

	useEffect(() => {
		if ('staticDictionaries' in props) {
			setDictionaries(props.staticDictionaries);
			setLoading(false);
		} else {
			// const fetchData = async () => {
			//   try {
			//     const result = await fetchRemoteDictionary(props.lecternUrl, props.dictionaryName);
			//     if (result) {
			//       setVersions(result.versions);
			//       setDictionaries(result.dictionaries);
			//       setError(false);
			//     } else {
			//       setError(true);
			//     }
			//   } catch (err) {
			//     console.error(err);
			//     setError(true);
			//   } finally {
			//     setLoading(false);
			//   }
			// };
			// fetchData();
			setError(true);
			setLoading(false);
		}
	}, [props]);

	const selectedDictionary = dictionaries?.[currentDictionaryIndex];

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
		selectedDictionary,
	};

	return <DictionaryDataContext.Provider value={value}>{props.children}</DictionaryDataContext.Provider>;
}

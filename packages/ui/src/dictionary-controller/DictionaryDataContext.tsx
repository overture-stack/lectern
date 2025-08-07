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

import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

export type DictionaryServerUnion = DictionaryServerRecord | Dictionary;

type DictionaryContextType = {
	data: {
		dictionaries: DictionaryServerUnion[] | undefined;
		lecternUrl: string;
		name: string;
	};
	loading: boolean;
	error: boolean | undefined;
};

type DictionaryProviderProps = {
	lecternUrl: string;
	dictionaryName: string;
};

const DictionaryDataContext = createContext<DictionaryContextType | undefined>(undefined);

const fetchDictionary = async (
	setIsLoading: (isLoading: boolean) => void,
	setError: (hasError: boolean) => void,
	setDictionaryData: (data: Dictionary[] | undefined) => void,
	setDictionaryVersions: (data: DictionarySummary[] | undefined) => void,
	lecternUrl: string,
	dictionaryName: string,
) => {
	try {
		setIsLoading(true);
		const fetchedDictionaryVersions = await lectern.rest.listDictionaries(lecternUrl, {
			name: dictionaryName,
		});
		if (!fetchedDictionaryVersions.success) {
			throw new Error('Failed to fetch dictionary versions');
		}
		setDictionaryVersions(fetchedDictionaryVersions.data);
		await fetchAllDictionaryDataFromVersions(
			fetchedDictionaryVersions.data,
			setIsLoading,
			setDictionaryData,
			setError,
			lecternUrl,
		);
	} catch (err) {
		console.error('Error loading dictionary versions:', err);
		setError(true);
	} finally {
		setIsLoading(false);
	}
};

const fetchAllDictionaryDataFromVersions = async (
	versions: DictionarySummary[],
	setIsLoading: (isLoading: boolean) => void,
	setDictionaryData: (data: Dictionary[] | undefined) => void,
	setError: (hasError: boolean) => void,
	lecternUrl: string,
) => {
	try {
		setIsLoading(true);
		const dictionaryFetches = versions.map((dictionaryVersion) =>
			lectern.rest.getDictionary(lecternUrl, {
				name: dictionaryVersion.name,
				version: dictionaryVersion.version,
			}),
		);

		const results = await Promise.all(dictionaryFetches);

		const validDictionaries: Dictionary[] = results.filter((res) => res.success).map((res) => res.data);

		setDictionaryData(validDictionaries.length > 0 ? validDictionaries : undefined);
	} catch (err) {
		console.error('Error loading dictionary data:', err);
		setError(true);
	} finally {
		setIsLoading(false);
	}
};

export function useDictionaryDataContext(): DictionaryContextType {
	const context = useContext(DictionaryDataContext);
	if (context === undefined) {
		throw new Error('useDictionaryDataContext must be used within a DictionaryDataProvider');
	}
	return context;
}

export function DictionaryDataProvider(props: PropsWithChildren<DictionaryProviderProps>) {
	const [dictionaryVersions, setDictionaryVersions] = useState<DictionarySummary[] | undefined>(undefined);

	const [dictionaryData, setDictionaryData] = useState<DictionaryServerUnion[] | undefined>(undefined);
	const [loading, setIsLoading] = useState(true);
	const [error, setError] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		fetchDictionary(
			setIsLoading,
			setError,
			setDictionaryData,
			setDictionaryVersions,
			props.lecternUrl,
			props.dictionaryName,
		);
		if (dictionaryVersions === undefined) {
			throw new Error('Dictionary versions are not loaded');
		}
		fetchAllDictionaryDataFromVersions(dictionaryVersions, setIsLoading, setDictionaryData, setError, props.lecternUrl);
	}, []);

	const contextValue: DictionaryContextType = {
		data: {
			dictionaries: dictionaryData,
			lecternUrl: props.lecternUrl,
			name: props.dictionaryName,
		},
		loading,
		error,
	};

	return <DictionaryDataContext.Provider value={contextValue}>{props.children}</DictionaryDataContext.Provider>;
}

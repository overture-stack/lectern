/*
 *
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
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { fetchAndValidateHostedDictionaries, fetchRemoteDictionary } from './sources';

export type DictionaryServerUnion = DictionaryServerRecord | Dictionary;

export type FilterOptions = 'Required' | 'All Fields';

export type DictionaryDataContextType = {
	dictionaries?: DictionaryServerUnion[];
	lecternUrl?: string;
	name?: string;
	loading: boolean;
	errors: string[];
};

export type DictionaryStateContextType = {
	currentDictionaryIndex: number;
	filters: FilterOptions[];
	setCurrentDictionaryIndex: (index: number) => void;
	setFilters: (filters: FilterOptions[]) => void;
	selectedDictionary?: DictionaryServerUnion;
};

export type StaticDictionaryProviderProps = {
	children: ReactNode;
	staticDictionaries: DictionaryServerUnion[];
};

export type UrlDictionaryProviderProps = {
	children: ReactNode;
	hostedUrl: string;
};

export type LecternDictionaryProviderProps = {
	children: ReactNode;
	lecternUrl: string;
	dictionaryName: string;
};

export const DictionaryDataContext = createContext<DictionaryDataContextType | undefined>(undefined);
const DictionaryStateContext = createContext<DictionaryStateContextType | undefined>(undefined);

export const useDictionaryDataContext = (): DictionaryDataContextType => {
	const context = useContext(DictionaryDataContext);
	if (context === undefined) {
		console.error('useDictionaryDataContext must be used within a DictionaryDataProvider');
		throw new Error('useDictionaryDataContext must be used within a DictionaryDataProvider');
	}
	return context;
};

export const useDictionaryStateContext = (): DictionaryStateContextType => {
	const context = useContext(DictionaryStateContext);
	if (context === undefined) {
		console.error('useDictionaryStateContext must be used within a DictionaryStateProvider');
		throw new Error('useDictionaryStateContext must be used within a DictionaryStateProvider');
	}
	return context;
};

const createErrorMessage = (err: unknown): string => {
	if (err instanceof Error) {
		return err.message;
	} else if (typeof err === 'string') {
		return err;
	}
	return 'Something went wrong';
};

export const DictionaryStaticDataProvider = ({ children, staticDictionaries }: StaticDictionaryProviderProps) => {
	const value: DictionaryDataContextType = {
		dictionaries: staticDictionaries,
		loading: false,
		errors: [],
	};

	return <DictionaryDataContext.Provider value={value}>{children}</DictionaryDataContext.Provider>;
};

export const HostedDictionaryDataProvider = ({ children, hostedUrl }: UrlDictionaryProviderProps) => {
	const [dictionaries, setDictionaries] = useState<DictionaryServerUnion[]>([]);
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState<string[]>([]);

	useEffect(() => {
		const fetchHostedDictionaries = async () => {
			try {
				const dictionariesData = await fetchAndValidateHostedDictionaries(hostedUrl);
				setDictionaries([dictionariesData]);
				setErrors([]);
			} catch (err) {
				console.error('Error loading hosted dictionary data:', err);
				setErrors([createErrorMessage(err)]);
			} finally {
				setLoading(false);
			}
		};

		fetchHostedDictionaries();
	}, [hostedUrl]);

	const value: DictionaryDataContextType = {
		dictionaries,
		loading,
		errors,
	};

	return <DictionaryDataContext.Provider value={value}>{children}</DictionaryDataContext.Provider>;
};

export const DictionaryLecternDataProvider = ({
	children,
	lecternUrl,
	dictionaryName,
}: LecternDictionaryProviderProps) => {
	const [dictionaries, setDictionaries] = useState<DictionaryServerUnion[]>([]);
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState<string[]>([]);

	useEffect(() => {
		const fetchRemoteDictionaries = async () => {
			try {
				const { dictionaries: fetchedDictionaries } = await fetchRemoteDictionary(lecternUrl, dictionaryName);
				setDictionaries(fetchedDictionaries);
				setErrors([]);
			} catch (err) {
				console.error('Error loading remote dictionary data:', err);
				setErrors([createErrorMessage(err)]);
			} finally {
				setLoading(false);
			}
		};

		fetchRemoteDictionaries();
	}, [lecternUrl, dictionaryName]);

	const value: DictionaryDataContextType = {
		dictionaries,
		lecternUrl,
		name: dictionaryName,
		loading,
		errors,
	};

	return <DictionaryDataContext.Provider value={value}>{children}</DictionaryDataContext.Provider>;
};

export type DictionaryStateProviderProps = {
	children: ReactNode;
};

export const DictionaryStateProvider = ({ children }: DictionaryStateProviderProps) => {
	const [currentDictionaryIndex, setCurrentDictionaryIndex] = useState(0);
	const [filters, setFilters] = useState<FilterOptions[]>([]);

	const dictionaryData = useDictionaryDataContext();
	const { dictionaries } = dictionaryData;
	const selectedDictionary = dictionaries?.[currentDictionaryIndex];

	const value: DictionaryStateContextType = {
		currentDictionaryIndex,
		filters,
		setCurrentDictionaryIndex,
		setFilters,
		selectedDictionary,
	};

	return <DictionaryStateContext.Provider value={value}>{children}</DictionaryStateContext.Provider>;
};

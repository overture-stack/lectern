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

import { css } from '@emotion/react';
import { Dictionary, Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import React, { useState } from 'react';
import Accordion, { AccordionData } from '../common/Accordion/Accordion';
import SchemaTable from './DataTable/SchemaTable/SchemaTable';
import DictionaryHeader from './DictionaryHeader';
import { FilterOptions } from './InteractionPanel/AttributeFilterDropdown';
import InteractionPanel from './InteractionPanel/InteractionPanel';

const interactionPanelSpacing = css`
	margin-bottom: 24px;
`;

export type DataDictionaryPageProps = {
	dictionaries: Dictionary[];
	dictionaryIndex?: number;
	lecternUrl?: string;
	onVersionChange?: (index: number) => void;
};

const DataDictionaryPage = ({
	dictionaries,
	dictionaryIndex = 0,
	lecternUrl = '',
	onVersionChange,
}: DataDictionaryPageProps) => {
	const [filters, setFilters] = useState<FilterOptions[]>([]);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const dictionary = dictionaries[dictionaryIndex];

	const handleSelect = (schemaIndex: number) => {
		// All we need to do is hook up to the accordion's scroll into view, since that is already implemented
	};

	const handleVersionChange = (index: number) => {
		if (onVersionChange) {
			onVersionChange(index);
		}
	};

	const displayData = (data: Dictionary[], filters: FilterOptions[], dictionaryIndex: number) => {
		const currentDictionary = data?.[dictionaryIndex];
		// If the filter is not active or we just have nothing to filter, return the original data
		if (!filters?.length) {
			return currentDictionary;
		}
		return {
			...currentDictionary,
			schemas: currentDictionary?.schemas?.map((schema: Schema) => ({
				...schema,
				fields: schema.fields.filter((field: SchemaField) => {
					// we are going to filter via the constraints that are given
					if (filters?.includes('Required')) {
						const restrictions = field?.restrictions ?? [];
						if ('required' in restrictions && typeof restrictions !== 'function') {
							return restrictions.required === true;
						}
						return false;
					}
					return filters?.includes('All Fields');
				}),
			})),
		};
	};

	const filteredDictionary = displayData(dictionaries, filters, dictionaryIndex);

	const accordionItems: AccordionData[] =
		filteredDictionary?.schemas?.map((schema) => ({
			title: schema.name,
			openOnInit: !isCollapsed,
			description: schema.description,
			content: <SchemaTable schema={schema} />,
			schemaName: 'schemaName',
		})) || [];

	return (
		<div>
			<div
				css={css`
					position: sticky;
					top: 0;
					z-index: 10;
					background-color: white;
				`}
			>
				<DictionaryHeader name={dictionary.name} description={dictionary.description} version={dictionary.version} />
				<div css={interactionPanelSpacing}>
					<InteractionPanel
						setIsCollapsed={setIsCollapsed}
						onSelect={handleSelect}
						dictionaryConfig={{
							lecternUrl,
							dictionaryIndex,
							dictionaryData: dictionaries,
							onVersionChange: handleVersionChange,
							filters,
							setFilters,
						}}
					/>
				</div>
			</div>
			<Accordion accordionItems={accordionItems} />
		</div>
	);
};

export default DataDictionaryPage;

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
import { Dictionary } from '@overture-stack/lectern-dictionary';
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
		// Table of contents selection - could implement scroll here
		console.log('Selected schema index:', schemaIndex);
	};

	const handleVersionChange = (index: number) => {
		if (onVersionChange) {
			onVersionChange(index);
		}
	};

	// Filter fields based on the selected filters
	const getFilteredSchema = (schema: any) => {
		if (filters.includes('Required')) {
			// Only show required fields
			const filteredFields = schema.fields.filter((field: any) => field.restrictions?.required === true);
			return { ...schema, fields: filteredFields };
		}
		// 'All Fields' or no filter - show all fields
		return schema;
	};

	const accordionItems: AccordionData[] = dictionary.schemas.map((schema) => ({
		title: schema.name,
		openOnInit: !isCollapsed,
		description: schema.description,
		content: <SchemaTable schema={getFilteredSchema(schema)} />,
		dictionaryDownloadButtonProps: {
			version: dictionary.version || '1.0',
			name: dictionary.name,
			lecternUrl,
			fileType: 'tsv',
			iconOnly: true,
			disabled: false,
		},
		schemaName: 'schemaName',
	}));

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

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

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { Schema } from '@overture-stack/lectern-dictionary';
import React, { useEffect, useState } from 'react';
import Accordion from '../common/Accordion/Accordion';
import { ErrorModal } from '../common/ErrorModal';
import { useDictionaryDataContext } from '../dictionary-controller/DictionaryDataContext';
import SchemaTable from './DataTable/SchemaTable/SchemaTable';
import DictionaryHeader from './DictionaryHeader';
import InteractionPanel from './InteractionPanel/InteractionPanel';

export const DictionaryTableViewer = () => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedSchemaIndex, setSelectedSchemaIndex] = useState<number | null>(null);
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

	const { loading, error, selectedDictionary, filters } = useDictionaryDataContext();

	useEffect(() => {
		if (error) {
			setIsErrorModalOpen(true);
		}
	}, [error]);

	const getFilteredSchema = (schema: Schema) => {
		if (filters.includes('Required')) {
			return {
				...schema,
				fields: schema.fields.filter((field) => {
					if (field.restrictions && typeof field.restrictions === 'object' && 'required' in field.restrictions) {
						return field.restrictions.required === true;
					}
					return false;
				}),
			};
		}
		return schema;
	};

	const accordionItems =
		selectedDictionary?.schemas?.map((schema: Schema, index: number) => ({
			title: schema.name,
			description: schema.description,
			content: <SchemaTable schema={getFilteredSchema(schema)} />,
			schemaName: schema.name,
		})) || [];

	const handleSchemaSelect = (schemaIndex: number) => {
		setSelectedSchemaIndex(schemaIndex);
		const element = document.getElementById(schemaIndex.toString());
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const containerStyle = css`
		max-width: 80%;
		margin: 0 auto;
		padding: 0 1rem;
	`;

	const emptyStateStyle = css`
		padding: 10px;
		text-align: center;
	`;

	return (
		<div css={containerStyle}>
			<DictionaryHeader
				name={loading ? '' : (selectedDictionary?.name ?? '')}
				description={loading ? undefined : selectedDictionary?.description}
				version={loading ? undefined : selectedDictionary?.version}
				disabled={loading || !!error}
			/>
			<InteractionPanel onSelect={handleSchemaSelect} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
			{!loading && !error && selectedDictionary && (
				<Accordion accordionItems={accordionItems} collapseAll={isCollapsed} />
			)}
			{!loading && !error && !selectedDictionary && (
				<div css={emptyStateStyle}>
					<div>No dictionary data available.</div>
				</div>
			)}

			<ErrorModal
				isOpen={isErrorModalOpen}
				setIsOpen={setIsErrorModalOpen}
				errors={['Failed to load dictionary. Please check your connection and try again.']}
			/>
		</div>
	);
};

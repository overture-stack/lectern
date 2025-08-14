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
import type { Schema } from '@overture-stack/lectern-dictionary';
import { useEffect, useMemo, useState } from 'react';

import Accordion from '../common/Accordion/Accordion';
import { useDictionaryDataContext } from '../dictionary-controller/DictionaryDataContext';
import type { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
import { isFieldRequired } from '../utils/isFieldRequired';
import SchemaTable from './DataTable/SchemaTable/SchemaTable';
import DictionaryHeader from './DictionaryHeader';
import InteractionPanel from './InteractionPanel/InteractionPanel';

const pageContainerStyle = (theme: Theme) => css`
	margin: 0 auto;
	min-height: calc(100vh - ${theme.dimensions.navbar.height}px - ${theme.dimensions.footer.height}px);
	padding: 0 16px 40px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const headerPanelBlockStyle = css`
	display: flex;
	flex-direction: column;
	gap: 0;
`;

/**
 * The main table viewer page which consumes the dictionary data context
 * and renders the header, sticky interaction panel, and schema accordion.
 */
export const DictionaryTableViewer = () => {
	const theme: Theme = useThemeContext();
	const { loading, error, dictionaries, currentDictionaryIndex, filters } = useDictionaryDataContext();
	const selectedDictionary = dictionaries?.[currentDictionaryIndex];

	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

	useEffect(() => {
		if (error || (!loading && !selectedDictionary)) {
			setIsErrorModalOpen(true);
		}
	}, [error, loading, selectedDictionary]);

	const getFilteredSchema = (schema: Schema) => {
		if (filters.includes('Required')) {
			return {
				...schema,
				fields: schema.fields.filter((field) => isFieldRequired(field)),
			};
		}
		return schema;
	};

	const accordionItems = useMemo(
		() =>
			selectedDictionary?.schemas?.map((schema: Schema) => ({
				title: schema.name,
				description: schema.description,
				content: <SchemaTable schema={getFilteredSchema(schema)} />,
				schemaName: schema.name,
			})) || [],
		[selectedDictionary, filters],
	);

	const handleSchemaSelect = (schemaIndex: number) => {
		const element = document.getElementById(schemaIndex.toString());
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	if (loading) {
		return (
			<div css={pageContainerStyle(theme)}>
				<DictionaryHeader name="" isLoading />
			</div>
		);
	}

	if (!selectedDictionary) {
		return <div css={pageContainerStyle(theme)}>{/* No dictionary data found; error handling removed for now */}</div>;
	}

	const { name, description, version } = selectedDictionary;

	return (
		<div css={pageContainerStyle(theme)}>
			<div css={headerPanelBlockStyle}>
				<DictionaryHeader name={name ?? ''} description={description} version={version} />
				<InteractionPanel onSelect={handleSchemaSelect} setIsCollapsed={setIsCollapsed} />
			</div>
			<Accordion accordionItems={accordionItems} collapseAll={isCollapsed} />

			{/* Error modal temporarily disabled here; will be handled in stories */}
		</div>
	);
};

export default DictionaryTableViewer;

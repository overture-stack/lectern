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
import type { Schema, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { useRef, useState } from 'react';

import Accordion from '../common/Accordion/Accordion';
import { ErrorModal } from '../common/Error/ErrorModal';
import { useDictionaryDataContext, useDictionaryStateContext } from '../dictionary-controller/DictionaryDataContext';
import type { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
import { isFieldRequired } from '../utils/isFieldRequired';
import SchemaTable from './DataTable/SchemaTable/SchemaTable';
import DictionaryHeader from './DictionaryHeader';
import DictionaryViewerLoadingPage from './DictionaryViewer/DictionaryViewerLoadingPage';
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

const isConditionalRestriction = (schemaFieldRestriction: SchemaFieldRestrictions) => {
	return schemaFieldRestriction && 'if' in schemaFieldRestriction && schemaFieldRestriction.if !== undefined;
};

const getFilteredSchema = (schema: Schema, filters: string[]) => {
	if (filters.includes('Required')) {
		return {
			...schema,
			fields: schema.fields.filter((field) => {
				return isFieldRequired(field) || isConditionalRestriction(field.restrictions);
			}),
		};
	}
	return schema;
};

const ErrorDisplay = ({ errors, onContactClick }: { errors: string[]; onContactClick: () => void }) => {
	const theme = useThemeContext();
	const isErrorModalOpen = errors.length > 0;

	return (
		<div css={pageContainerStyle(theme)}>
			<ErrorModal isOpen={isErrorModalOpen} setIsOpen={() => {}} errors={errors} onContactClick={onContactClick} />
		</div>
	);
};

export const DictionaryTableViewer = () => {
	const theme = useThemeContext();
	const { loading, errors } = useDictionaryDataContext();
	const { filters, selectedDictionary } = useDictionaryStateContext();

	const [isCollapsed, setIsCollapsed] = useState(false);
	const [selectedSchemaIndex, setSelectedSchemaIndex] = useState<number | undefined>(undefined);
	const accordionRefs = useRef<(HTMLLIElement | null)[]>([]);

	const accordionItems =
		selectedDictionary?.schemas?.map((schema: Schema) => ({
			title: schema.name,
			description: schema.description,
			content: <SchemaTable schema={getFilteredSchema(schema, filters)} />,
			schemaName: schema.name,
		})) || [];

	const handleAccordionSelect = (accordionIndex: number) => {
		setSelectedSchemaIndex(accordionIndex);
		const element = accordionRefs.current[accordionIndex];
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	};

	// TODO: Provide a function for the errorModal contact click
	if (loading) {
		return <DictionaryViewerLoadingPage />;
	} else if (errors.length > 0) {
		return (
			<ErrorDisplay
				errors={errors}
				onContactClick={() =>
					console.log(
						'TODO: need to implement a function for action needs to be done when error modal contact is clicked',
					)
				}
			/>
		);
	} else if (!selectedDictionary) {
		return (
			<ErrorDisplay
				errors={['No dictionary data provided']}
				onContactClick={() =>
					console.log(
						'TODO: need to implement a function for action needs to be done when error modal contact is clicked',
					)
				}
			/>
		);
	}

	return (
		<div css={pageContainerStyle(theme)}>
			<div css={headerPanelBlockStyle}>
				<DictionaryHeader />
				<InteractionPanel onSelect={handleAccordionSelect} setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
			</div>
			<Accordion accordionItems={accordionItems} collapseAll={isCollapsed} selectedIndex={selectedSchemaIndex} />
		</div>
	);
};

export default DictionaryTableViewer;

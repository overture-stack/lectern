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
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { useState } from 'react';
import Accordion from '../common/Accordion/Accordion';
import { useThemeContext } from '../theme/ThemeContext';
import DictionaryHeader from './DictionaryHeader';
import InteractionPanel from './InteractionPanel/InteractionPanel';

export type DataDictionaryPageProps = {
	dictionary: Dictionary;
	lecternUrl?: string;
	disabled?: boolean;
	dictionaryVersions?: Dictionary[];
	currentVersionIndex?: number;
	onVersionChange?: (version: number) => void;
};

const pageContainerStyle = css`
	width: 100%;
	min-height: 100vh;
	background-color: #f8fafc;
`;

const contentContainerStyle = css`
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 24px 48px 24px;
`;

const accordionContainerStyle = css`
	margin-top: 24px;
`;

const DataDictionaryPage = ({
	dictionary,
	lecternUrl = 'http://localhost:3031',
	disabled = false,
	dictionaryVersions,
	currentVersionIndex = 0,
	onVersionChange,
}: DataDictionaryPageProps) => {
	const theme = useThemeContext();

	const [filteredData, setFilteredData] = useState<Dictionary>(dictionary);
	const [isFiltered, setIsFiltered] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [accordionStates, setAccordionStates] = useState<Record<string, boolean>>(() => {
		// Initialize all schemas as open by default
		const initialStates: Record<string, boolean> = {};
		dictionary.schemas.forEach((schema) => {
			initialStates[schema.name] = true;
		});
		return initialStates;
	});

	const handleAccordionToggle = (schemaName: string, isOpen: boolean) => {
		setAccordionStates((prev) => ({
			...prev,
			[schemaName]: isOpen,
		}));
	};

	// Handle expand/collapse all
	const handleSetIsCollapsed = (collapsed: boolean) => {
		setIsCollapsed(collapsed);
		const newStates: Record<string, boolean> = {};
		dictionary.schemas.forEach((schema) => {
			newStates[schema.name] = !collapsed;
		});
		setAccordionStates(newStates);
	};

	const accordionItems = filteredData.schemas.map((schema) => ({
		title: schema.name,
		description: schema.description || '',
		openOnInit: accordionStates[schema.name] ?? true,
		content:
			'Paritur Lorem sint commodo deserunt duis nostrud. Quis cillum veniam dolor amet elit nulla. Pariatur sunt ex non minim labore et exercitation quis velit duis. Nisi minim commodo anim aute quis incididunt proident enim adipisicing eu do. Mollit tempor minim anim deserunt adipisicing. Magna esse labore eiusmod irure sunt cupidatat non et labore. Pariatur consectetur cupidatat ullamco dolor sit commodo proident cupidatat nulla occaecat qui ea. Ad nostrud magna quis anim veniam laboris do sint cillum nisi. Et sint enim eu proident ipsum. Deserunt ad ex non aliquip fugiat eiusmod tempor fugiat est et excepteur consequat excepteur ipsum.',
	}));

	return (
		<div css={pageContainerStyle}>
			<DictionaryHeader name={dictionary.name} version={dictionary.version} description={dictionary.description} />

			{/* Interaction Panel */}
			<InteractionPanel
				schemas={filteredData.schemas}
				dictionary={dictionary}
				filteredData={filteredData}
				disabled={disabled}
				isFiltered={isFiltered}
				version={dictionary.version}
				name={dictionary.name}
				lecternUrl={lecternUrl}
				setIsCollapsed={handleSetIsCollapsed}
				setFilteredData={setFilteredData}
				setIsFiltered={setIsFiltered}
				onAccordionToggle={handleAccordionToggle}
				onVersionChange={onVersionChange}
				dictionaryVersions={dictionaryVersions}
				currentVersionIndex={currentVersionIndex}
			/>

			{accordionItems.length > 0 && (
				<div css={accordionContainerStyle}>
					<Accordion key={`accordion-${Object.values(accordionStates).join('-')}`} accordionItems={accordionItems} />
				</div>
			)}

			{accordionItems.length === 0 && (
				<div
					css={css`
						text-align: center;
						padding: 48px 24px;
						color: ${theme.colors.grey_2};
						${theme.typography.heading}
					`}
				>
					No schemas found in this dictionary.
				</div>
			)}
		</div>
	);
};

export default DataDictionaryPage;

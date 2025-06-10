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
import TableOfContentsDropdown from './TableOfContentsDropdown';
import ExpandAllButton from './ExpandAllButton';
import CollapseAllButton from './CollapseAllButton';
import AttributeFilterDropdown from './AttributeFilterDropdown';
import DictionaryVersionSwitcher from './DictionaryVersionSwitcher';
import DownloadTemplatesButton from './DownloadTemplatesButton';
import { useThemeContext } from '../../theme/ThemeContext';
import type { Schema, Dictionary } from '@overture-stack/lectern-dictionary';

type InteractionPanelProps = {
	schemas: Schema[];
	dictionary: Dictionary;
	filteredData: Dictionary;
	disabled?: boolean;
	isFiltered: boolean;
	version: string;
	name: string;
	lecternUrl: string;
	setIsCollapsed: (isCollapsed: boolean) => void;
	setFilteredData: (dict: Dictionary) => void;
	setIsFiltered: (bool: boolean) => void;
	onAccordionToggle: (schemaName: string, isOpen: boolean) => void;
	onVersionChange?: (version: number) => void;
	dictionaryVersions?: Dictionary[];
	currentVersionIndex?: number;
};

const InteractionPanel = ({
	schemas,
	dictionary,
	filteredData,
	disabled = false,
	isFiltered,
	version,
	name,
	lecternUrl,
	setIsCollapsed,
	setFilteredData,
	setIsFiltered,
	onAccordionToggle,
	onVersionChange,
	dictionaryVersions,
	currentVersionIndex = 0,
}: InteractionPanelProps) => {
	const theme = useThemeContext();

	const panelStyles = css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid ${theme.colors.grey_4};
		background-color: ${theme.colors.white};
		min-height: 70px;
		flex-wrap: nowrap;
		overflow-x: auto;
		overflow-y: visible;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: relative;
	`;

	const leftSectionStyles = css`
		display: flex;
		align-items: center;
		gap: 16px;
	`;

	const rightSectionStyles = css`
		display: flex;
		align-items: center;
		gap: 16px;
	`;

	return (
		<div css={panelStyles}>
			<div css={leftSectionStyles}>
				<TableOfContentsDropdown schemas={schemas} onAccordionToggle={onAccordionToggle} disabled={disabled} />
				<AttributeFilterDropdown
					data={dictionary}
					isFiltered={isFiltered}
					setFilteredData={setFilteredData}
					setIsFiltered={setIsFiltered}
					disabled={disabled}
				/>
				<ExpandAllButton setIsCollapsed={setIsCollapsed} disabled={disabled} />
				<CollapseAllButton setIsCollapsed={setIsCollapsed} disabled={disabled} />
			</div>
			<div css={rightSectionStyles}>
				{onVersionChange && dictionaryVersions && (
					<DictionaryVersionSwitcher
						dictionaryData={dictionaryVersions}
						dictionaryIndex={currentVersionIndex}
						onVersionChange={onVersionChange}
						disabled={disabled}
					/>
				)}
				<DownloadTemplatesButton version={version} name={name} lecternUrl={lecternUrl} disabled={disabled} />
			</div>
		</div>
	);
};

export default InteractionPanel;

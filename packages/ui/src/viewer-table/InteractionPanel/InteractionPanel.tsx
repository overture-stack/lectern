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

import { css, SerializedStyles } from '@emotion/react';
import type { Dictionary } from '@overture-stack/lectern-dictionary';

import { type DictionaryServerRecord } from '../../../../client/src/rest/getDictionary';
import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import AttributeFilterDropdown, { FilterOptions } from './AttributeFilterDropdown';
import CollapseAllButton from './CollapseAllButton';
import DictionaryVersionSwitcher from './DictionaryVersionSwitcher';
import DownloadTemplatesButton from './DownloadTemplatesButton';
import ExpandAllButton from './ExpandAllButton';
import TableOfContentsDropdown from './TableOfContentsDropdown';

export type DictionaryServerUnion = Dictionary | DictionaryServerRecord;

export type InteractionPanelProps = {
	disabled?: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	onSelect: (schemaNameIndex: number) => void;
	dictionaryConfig: {
		lecternUrl: string;
		dictionaryIndex: number;
		dictionaryData: DictionaryServerUnion[];
		onVersionChange: (index: number) => void;
		filters: FilterOptions[];
		setFilters: (filters: FilterOptions[]) => void;
	};
	styles?: SerializedStyles;
};

const panelStyles = (theme: Theme, styles?: SerializedStyles) => css`
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
	${styles}
`;

const sectionStyles = css`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const InteractionPanel = ({
	disabled = false,
	setIsCollapsed,
	onSelect,
	dictionaryConfig,
	styles,
}: InteractionPanelProps) => {
	const theme: Theme = useThemeContext();
	const selectedDictionary: DictionaryServerUnion = dictionaryConfig.dictionaryData[dictionaryConfig.dictionaryIndex];
	const createdAt: string = 'createdAt' in selectedDictionary ? selectedDictionary.createdAt : '';

	return (
		<div css={panelStyles(theme, styles)}>
			<div css={sectionStyles}>
				<TableOfContentsDropdown schemas={selectedDictionary.schemas} onSelect={onSelect} disabled={disabled} />
				<AttributeFilterDropdown
					filters={dictionaryConfig.filters}
					setFilters={dictionaryConfig.setFilters}
					disabled={disabled}
				/>
				<ExpandAllButton onClick={() => setIsCollapsed(false)} disabled={disabled} />
				<CollapseAllButton onClick={() => setIsCollapsed(true)} disabled={disabled} />
			</div>

			<div css={sectionStyles}>
				<DictionaryVersionSwitcher
					dictionaryData={dictionaryConfig.dictionaryData}
					dictionaryIndex={dictionaryConfig.dictionaryIndex}
					onVersionChange={dictionaryConfig.onVersionChange}
					disabled={disabled}
					title={`Version ${selectedDictionary.version} (${createdAt})`}
				/>
				<DownloadTemplatesButton
					fileType="tsv"
					version={selectedDictionary.version}
					name={selectedDictionary.name}
					lecternUrl={dictionaryConfig.lecternUrl}
					disabled={disabled}
				/>
			</div>
		</div>
	);
};

export default InteractionPanel;

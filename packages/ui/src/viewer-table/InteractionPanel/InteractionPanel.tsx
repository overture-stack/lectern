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
import { DictionaryServerRecord } from '@overture-stack/lectern-client/dist/rest';
import type { Dictionary } from '@overture-stack/lectern-dictionary';

import { useDictionaryDataContext } from '../../dictionary-controller/DictionaryDataContext';
import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import AttributeFilterDropdown, { type FilterOptions } from './AttributeFilterDropdown';
import CollapseAllButton from './CollapseAllButton';
import DictionaryVersionSwitcher from './DictionaryVersionSwitcher';
import DownloadTemplatesButton from './DownloadTemplatesButton';
import ExpandAllButton from './ExpandAllButton';
import TableOfContentsDropdown from './TableOfContentsDropdown';

export type DictionaryServerUnion = Dictionary | DictionaryServerRecord;

export type InteractionPanelProps = {
	setIsCollapsed: (isCollapsed: boolean) => void;
	onSelect: (schemaNameIndex: number) => void;
	onVersionChange: (index: number) => void;
	filters: FilterOptions[];
	setFilters: (filters: FilterOptions[]) => void;
	dictionaryIndex: number;
};

const panelStyles = (theme: Theme) => css`
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	padding: 8px 16px;
	border-top: 1px solid ${theme.colors.border_muted};
	border-bottom: 1px solid ${theme.colors.border_muted};
	background-color: ${theme.colors.white};
	flex-wrap: nowrap;
	box-shadow: 0 2px 4px ${theme.shadow.standard};
	min-height: 80px;
`;

const sectionStyles = css`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const InteractionPanel = ({
	setIsCollapsed,
	onSelect,
	dictionaryIndex,
	filters,
	setFilters,
	onVersionChange,
}: InteractionPanelProps) => {
	const theme: Theme = useThemeContext();
	const data = useDictionaryDataContext();
	const selectedDictionary: DictionaryServerUnion | undefined = data.data?.[dictionaryIndex];

	if (selectedDictionary === undefined) {
		return null;
	}
	return (
		<div css={panelStyles(theme)}>
			<div css={sectionStyles}>
				<TableOfContentsDropdown schemas={selectedDictionary.schemas} onSelect={onSelect} />
				<AttributeFilterDropdown filters={filters} setFilters={setFilters} />
				<ExpandAllButton onClick={() => setIsCollapsed(false)} />
				<CollapseAllButton onClick={() => setIsCollapsed(true)} />
			</div>

			<div css={sectionStyles}>
				<DictionaryVersionSwitcher dictionaryIndex={dictionaryIndex} onVersionChange={onVersionChange} />
				<DownloadTemplatesButton fileType="tsv" currentDictionaryIndex={dictionaryIndex} />
			</div>
		</div>
	);
};

export default InteractionPanel;

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
import type { Dictionary, Schema } from '@overture-stack/lectern-dictionary';
import { useState } from 'react';
import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import AttributeFilterDropdown, { FilterMapping } from './AttributeFilterDropdown';
import CollapseAllButton from './CollapseAllButton';
import DictionaryVersionSwitcher, { DictionaryConfig } from './DictionaryVersionSwitcher';
import DownloadTemplatesButton from './DownloadTemplatesButton';
import ExpandAllButton from './ExpandAllButton';
import TableOfContentsDropdown from './TableOfContentsDropdown';

type InteractionPanelProps = {
	disabled?: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	onSelect: (schemaNameIndex: number) => void;
	currDictionary: DictionaryConfig;
	setFilters: (filters: FilterMapping) => void;
};

const panelStyles = (theme: Theme) => css`
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
const InteractionPanel = ({
	disabled = false,
	setIsCollapsed,
	onSelect,
	currDictionary,
	setFilters,
}: InteractionPanelProps) => {
	const theme: Theme = useThemeContext();
	const currDict: Dictionary = currDictionary.dictionaryData[currDictionary.dictionaryIndex];
	return (
		<div css={panelStyles(theme)}>
			<div css={leftSectionStyles}>
				<TableOfContentsDropdown schemas={currDict.schemas} onSelect={onSelect} disabled={disabled} />
				<AttributeFilterDropdown filters={currDictionary.filters} setFilters={setFilters} disabled={disabled} />
				<ExpandAllButton onClick={() => setIsCollapsed(true)} disabled={disabled} />
				<CollapseAllButton onClick={() => setIsCollapsed(false)} disabled={disabled} />
			</div>
			<div css={rightSectionStyles}>
				<DictionaryVersionSwitcher config={currDictionary} disabled={disabled} />
				<DownloadTemplatesButton
					fileType="tsv"
					version={currDict.version}
					name={currDict.name}
					lecternUrl={currDictionary.lecternUrl}
					disabled={disabled}
				/>
			</div>
		</div>
	);
};

export default InteractionPanel;

/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { useDictionaryDataContext, useDictionaryStateContext } from '../../dictionary-controller/DictionaryDataContext';
import { type Theme, useThemeContext } from '../../theme/index';
import { ToolbarSkeleton } from '../Loading';
import Dropdown, { FilterRow, type FilterCategory } from '../../common/Dropdown/index';
import AttributeFilterButton from './AttributeFilterButton';
import CollapseAllButton from './CollapseAllButton';
import DiagramViewButton from './DiagramViewButton';
import DictionaryDownloadButton from './DictionaryDownloadButton';
import ExpandAllButton from './ExpandAllButton';
import TableOfContentsDropdown from './TableOfContentsDropdown';

export type ToolbarProps = {
	onSelect: (schemaNameIndex: number) => void;
	setIsCollapsed: (collapsed: boolean) => void;
	isCollapsed: boolean;
	filterCategories?: FilterCategory[];
};

const panelStyles = (theme: Theme) => css`
	display: flex;
	width: 100%
	width: -webkit-fit-content;
	align-items: center;
	justify-content: space-between;
	padding: 16px 0;
	background-color: ${theme.colors.white};
	flex-wrap: nowrap;
	position: sticky;
	z-index: 10;
	top: 0px;
`;

const sectionStyles = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;
`;

const Toolbar = ({ onSelect, setIsCollapsed, isCollapsed, filterCategories }: ToolbarProps) => {
	const theme: Theme = useThemeContext();
	const { loading, errors } = useDictionaryDataContext();
	const { selectedDictionary, filterSelections, toggleFilter } = useDictionaryStateContext();
	const { ListFilter } = theme.icons;

	if (!selectedDictionary && !loading) {
		return null;
	}

	if (loading) {
		return <ToolbarSkeleton />;
	}

	return (
		<div css={panelStyles(theme)}>
			<div css={sectionStyles}>
				<TableOfContentsDropdown schemas={selectedDictionary?.schemas ?? []} onSelect={onSelect} />
				<DiagramViewButton />
				{isCollapsed ?
					<ExpandAllButton onClick={() => setIsCollapsed(false)} />
				:	<CollapseAllButton onClick={() => setIsCollapsed(true)} />}
				<AttributeFilterButton />
				{filterCategories && filterCategories.length > 0 && (
					<Dropdown
						leftIcon={<ListFilter />}
						title={filterCategories.length === 1 ? filterCategories[0].label : 'Filters'}
						disabled={loading || errors.length > 0}
						closeOnSelect={false}
					>
						{filterCategories.map((category) => (
							<FilterRow
								key={category.filterProperty}
								category={category}
								showHeader={filterCategories.length > 1}
								selections={filterSelections[category.filterProperty] ?? []}
								onToggle={(option) => toggleFilter(category.filterProperty, option)}
							/>
						))}
					</Dropdown>
				)}
			</div>
			<div css={sectionStyles}>
				<DictionaryDownloadButton fileType="tsv" />
			</div>
		</div>
	);
};

export default Toolbar;

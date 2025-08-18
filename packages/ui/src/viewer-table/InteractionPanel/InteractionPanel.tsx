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
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { useDictionaryDataContext, useDictionaryStateContext } from '../../dictionary-controller/DictionaryDataContext';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import AttributeFilterDropdown from './AttributeFilterDropdown';
import CollapseAllButton from './CollapseAllButton';
import { DictionaryDownloadButton } from './DictionaryDownloadButton';
import DictionaryVersionSwitcher from './DictionaryVersionSwitcher';
import ExpandAllButton from './ExpandAllButton';
import TableOfContentsDropdown from './TableOfContentsDropdown';

export type InteractionPanelProps = {
	onSelect: (schemaNameIndex: number) => void;
	setIsCollapsed: (collapsed: boolean) => void;
};

const panelStyles = (theme: Theme) => css`
	display: flex;
	width: 100%
	width: -webkit-fit-content;
	align-items: center;
	justify-content: space-between;
	padding: 8px 16px;
	border-top: 1px solid ${theme.colors.border_muted};
	border-bottom: 1px solid ${theme.colors.border_muted};
	background-color: ${theme.colors.white};
	flex-wrap: nowrap;
	min-height: 80px;
	position: sticky;
	top: ${theme.dimensions.navbar.height}px;
	z-index: 10;
`;

const sectionStyles = css`
	display: flex;
	align-items: center;
	gap: 16px;
`;

const InteractionPanelSkeleton = () => {
	const theme = useThemeContext();
	return (
		<SkeletonTheme
			customHighlightBackground={`linear-gradient(270deg, rgba(229, 237, 243, 0) 0%, ${theme.colors.accent_1} 100%)`}
			baseColor="transparent"
		>
			<Skeleton width={160} height={42} inline />
			<Skeleton width={120} height={42} inline />
			<Skeleton width={120} height={42} inline />
		</SkeletonTheme>
	);
};

const InteractionPanel = ({ onSelect, setIsCollapsed }: InteractionPanelProps) => {
	const theme: Theme = useThemeContext();
	const { loading } = useDictionaryDataContext();
	const { selectedDictionary } = useDictionaryStateContext();

	if (!selectedDictionary?.schemas && !loading) {
		return null;
	}

	return (
		<div css={panelStyles(theme)}>
			{loading ?
				<InteractionPanelSkeleton />
			:	<div css={sectionStyles}>
					<TableOfContentsDropdown schemas={selectedDictionary?.schemas ?? []} onSelect={onSelect} />
					<AttributeFilterDropdown />
					<ExpandAllButton onClick={() => setIsCollapsed(false)} />
					<CollapseAllButton onClick={() => setIsCollapsed(true)} />
				</div>
			}
			<div css={sectionStyles}>
				<DictionaryVersionSwitcher />
				<DictionaryDownloadButton fileType="tsv" />
			</div>
		</div>
	);
};

export default InteractionPanel;

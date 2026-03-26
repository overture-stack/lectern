/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
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
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useDictionaryStateContext } from '../../dictionary-controller/DictionaryDataContext';
import { pillStyle } from '../../theme/emotion/index';
import { type Theme, useThemeContext } from '../../theme/index';

const barStyles = (theme: Theme) => css`
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	margin-top: 12px;
	padding: 12px 6px;
	background-color: ${theme.colors.accent_1};
	border-block: 1px solid ${theme.colors.border_light};
`;

const labelStyles = (theme: Theme) => css`
	${theme.typography.subtitleBold};
	font-size: 14px;
	color: ${theme.colors.accent};
	text-transform: uppercase;
`;

const separatorStyles = (theme: Theme) => css`
	width: 1px;
	height: 20px;
	background-color: ${theme.colors.accent_dark};
	flex-shrink: 0;
	margin: 0 4px;
`;

const pillCloseStyles = (theme: Theme) => css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	border: none;
	background: none;
	padding: 0;
	color: ${theme.colors.accent};
	line-height: 1;

	&:hover {
		color: ${theme.colors.accent_dark};
	}
`;

const andStyles = (theme: Theme) => css`
	${theme.typography.dataBold};
	color: ${theme.colors.accent};
	text-transform: uppercase;
`;

const filterEntryStyles = css`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const resetStyles = (theme: Theme) => css`
	${theme.typography.data};
	color: ${theme.colors.accent};
	text-decoration: underline;
	cursor: pointer;
	background: none;
	border: none;
	padding: 0;
	margin-left: 4px;
	white-space: nowrap;
`;

const ActiveFilterBar = () => {
	const theme = useThemeContext();
	const { filterSelections, toggleFilter, resetFilters } = useDictionaryStateContext();
	const { Cancel } = theme.icons;

	const formatCategory = (category: string) => {
		const label = category.split('.')[1] ?? category;
		return label.charAt(0).toUpperCase() + label.slice(1);
	};

	const entries = Object.entries(filterSelections).flatMap(([category, values]) =>
		values.map((value) => ({ category, value })),
	);

	if (entries.length === 0) {
		return null;
	}

	return (
		<div css={barStyles(theme)}>
			<span css={labelStyles(theme)}>Active Filters</span>
			<div css={separatorStyles(theme)} />
			{entries.map((entry, index) => (
				<div key={`${entry.category}-${entry.value}`} css={filterEntryStyles}>
					{index > 0 && <span css={andStyles(theme)}>AND</span>}
					<span css={pillStyle(theme)}>
						{formatCategory(entry.category)}: {entry.value}
						<button
							css={pillCloseStyles(theme)}
							onClick={() => toggleFilter(entry.category, entry.value)}
						>
							<Cancel height={16} width={16} />
						</button>
					</span>
				</div>
			))}
			<button css={resetStyles(theme)} onClick={resetFilters}>
				Reset all
			</button>
		</div>
	);
};

export default ActiveFilterBar;

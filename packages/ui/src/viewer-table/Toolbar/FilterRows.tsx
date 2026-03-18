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

import { useDictionaryStateContext } from '../../dictionary-controller/DictionaryDataContext';
import { type Theme, useThemeContext } from '../../theme/index';
import type { CustomFilterCategory } from '../DictionaryTableViewer';

const sectionHeaderStyle = (theme: Theme) => css`
	${theme.typography.buttonText};
	font-size: 13px;
	color: ${theme.colors.accent_dark};
	padding: 6px 12px;
	border-top: 1px solid ${theme.colors.border_button};
	border-bottom: 1px solid ${theme.colors.border_button};
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const categoryGroupStyle = css`
	&:first-of-type > div:first-of-type {
		border-top: none;
	}
`;

const checkboxRowStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 12px;
	cursor: pointer;
	&:hover {
		background-color: ${theme.colors.accent_1};
	}
	input[type='checkbox'] {
		accent-color: #3a8736;
	}
`;

const checkboxLabelStyle = (theme: Theme) => css`
	${theme.typography.body};
	color: ${theme.colors.accent_dark};
	cursor: pointer;
	user-select: none;
`;

export type FilterRowsProps = {
	categories: CustomFilterCategory[];
};

const FilterRows = ({ categories }: FilterRowsProps) => {
	const theme = useThemeContext();
	const { customFilterSelections, toggleCustomFilter } = useDictionaryStateContext();
	const hasMultipleCategories = categories.length > 1;

	return (
		<>
			{categories.map((category) => {
				const selected = customFilterSelections[category.filterProperty] ?? [];
				return (
					<div key={category.filterProperty} css={categoryGroupStyle}>
						{hasMultipleCategories && <div css={sectionHeaderStyle(theme)}>{category.label} Filter</div>}
						{category.options.map((option) => {
							const isChecked = selected.includes(option);
							return (
								<label key={option} css={checkboxRowStyle(theme)}>
									<input
										type="checkbox"
										checked={isChecked}
										onChange={() => toggleCustomFilter(category.filterProperty, option)}
									/>
									<span css={checkboxLabelStyle(theme)}>{option}</span>
								</label>
							);
						})}
					</div>
				);
			})}
		</>
	);
};

export default FilterRows;

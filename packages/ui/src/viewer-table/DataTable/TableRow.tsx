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

import { css, keyframes } from '@emotion/react';
import { Row, flexRender } from '@tanstack/react-table';

import { type Theme, useThemeContext } from '../../theme/index';

const highlightPulse = (theme: Theme) => keyframes`
	0% { background-color: ${theme.colors.accent_light}; }
	100% { background-color: transparent; }
`;

const rowStyle = (index: number, theme: Theme) => css`
	background-color: ${index % 2 === 0 ? theme.colors.white : theme.colors.background_alternate};
	scroll-margin-top: 100px;
`;

const highlightedCellStyle = (theme: Theme) => css`
	animation: ${highlightPulse(theme)} 2s ease-out 0.5s forwards;
`;

const tdStyle = (theme: Theme, cellIndex: number, rowIndex: number) => css`
	${theme.typography.paragraphSmall}
	border: 2px solid ${theme.colors.border_light};
	text-align: ${cellIndex === 1 || cellIndex === 2 ? 'center' : 'left'};
	padding: 12px;
	vertical-align: middle;
	min-width: 150px;

	${cellIndex === 0 &&
	`
		position: sticky;
		left: 0;
		max-width: 15vw;
		min-width: 325px;
		background-color: ${rowIndex % 2 === 0 ? theme.colors.white : theme.colors.background_alternate};
	`}
`;

export type TableRowProps<T> = {
	row: Row<T>;
	index: number;
	fieldId?: string;
	isHighlighted?: boolean;
};

/**
 * Generic table row component with alternating background colors.
 * @template T - Row data type
 * @param {Row<T>} row - TanStack table row object
 * @param {number} index - Row index for styling
 * @param {string} fieldId - Optional field ID for anchor navigation (format: schemaName.fieldName)
 * @param {boolean} isHighlighted - Whether to highlight this row with a pulse animation
 * @returns {JSX.Element} Table row element
 */
const TableRow = <T,>({ row, index, fieldId, isHighlighted }: TableRowProps<T>) => {
	const theme: Theme = useThemeContext();

	return (
		<tr id={fieldId} css={rowStyle(index, theme)}>
			{row.getVisibleCells().map((cell, cellIndex) => {
				return (
					<td
						key={cell.id}
						css={[tdStyle(theme, cellIndex, index), isHighlighted && highlightedCellStyle(theme)]}
					>
						<div
							css={css`
								${theme.typography.data}
								white-space: pre-wrap;
							`}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</div>
					</td>
				);
			})}
		</tr>
	);
};

export default TableRow;

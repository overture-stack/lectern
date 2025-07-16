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
import { Row, flexRender } from '@tanstack/react-table';

import ReadMoreText from '../../common/ReadMoreText';
import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

const rowStyle = (index: number) => css`
	background-color: ${index % 2 === 0 ? '' : '#F5F7F8'};
`;

const tdStyle = (theme: Theme, cellIndex: number, rowIndex: number) => css`
	${theme.typography.data}
	padding: 12px;
	max-width: 30vw;
	vertical-align: top;
	${cellIndex === 0 &&
	`
		position: sticky;
		left: 0;
		background-color: ${rowIndex % 2 === 0 ? 'white' : '#F5F7F8'};
	`}
	border: 1px solid #DCDDE1;
`;

export type TableRowProps<T> = {
	row: Row<T>;
	index: number;
};

const TableRow = <T,>({ row, index }: TableRowProps<T>) => {
	const theme = useThemeContext();
	return (
		<tr key={row.id} css={rowStyle(index)}>
			{row.getVisibleCells().map((cell, cellIndex) => {
				return (
					<td key={cell.id} css={tdStyle(theme, cellIndex, index)}>
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

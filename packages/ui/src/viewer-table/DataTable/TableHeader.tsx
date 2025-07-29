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
import { flexRender, HeaderGroup } from '@tanstack/react-table';

import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

const thStyle = (theme: Theme, index: number) => css`
	${theme.typography.tableHeader};
	background: ${theme.colors.white};
	text-align: ${index === 0 || index === 3 ? 'left' : 'center'};
	padding: 12px;
	border-bottom: 1px solid ${theme.colors.border_medium};
	border: 1px solid ${theme.colors.border_light};
	${index === 0 &&
	`
		position: sticky;
		left: 0;
	`}
`;

export type TableHeaderProps<T> = {
	headerGroup: HeaderGroup<T>;
};

/**
 * Generic table header component
 * @template T - Row data type
 * @param {HeaderGroup<T>} headerGroup - TanStack table header group containing column definitions and rendering context
 * @returns {JSX.Element} Table header row element
 */

const TableHeader = <T,>({ headerGroup }: TableHeaderProps<T>) => {
	const theme: Theme = useThemeContext();

	return (
		<tr key={headerGroup.id}>
			{headerGroup.headers.map((header, index) => (
				<th key={header.id} colSpan={header.colSpan} css={thStyle(theme, index)}>
					{flexRender(header.column.columnDef.header, header.getContext())}
				</th>
			))}
		</tr>
	);
};

export default TableHeader;

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
import { useThemeContext } from '../../theme/ThemeContext';

const thStyle = css`
	background: #e5edf3;
	text-align: left;
	padding: 12px;
	border-bottom: 1px solid #dcdcdc;
`;

type TableHeaderProps<T> = {
	headerGroup: HeaderGroup<T>;
	columnSlice?: [number, number] | [number];
};

const TableHeader = <T,>({ headerGroup, columnSlice }: TableHeaderProps<T>) => {
	const theme = useThemeContext();
	const headers = columnSlice ? headerGroup.headers.slice(...columnSlice) : headerGroup.headers;

	return (
		<tr key={headerGroup.id}>
			{headers.map((header) => (
				<th
					key={header.id}
					colSpan={header.colSpan}
					css={css`
						${thStyle}
						${theme.typography.subheading2}
					`}
				>
					{flexRender(header.column.columnDef.header, header.getContext())}
				</th>
			))}
		</tr>
	);
};

export default TableHeader;

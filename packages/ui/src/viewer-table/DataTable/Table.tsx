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
import { ColumnDef, getCoreRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export type GenericTableProps<R> = {
	data: R[];
	columns: ColumnDef<R, any>[];
};

const sectionStyle = css`
	margin-bottom: 48px;
	max-width: 1200px;
`;

// We can keep the scrollbar which would mean it spans the whole table or just have the scrollbar hidden.
const tableContainerStyle = css`
	overflow-x: auto;
	-webkit-scrollbar: none;
	-ms-overflow-style: none;
	scrollbar-width: none;
	max-width: 100%;
	border-radius: 4px;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const tableStyle = css`
	min-width: 1200px;
	border-collapse: collapse;
	border: 1px solid lightgray;
	margin-top: 8px;
	position: relative;
`;
const tableHeaderStyle = css`
	border: 1px solid #dcdde1;
`;

const Table = <R,>({ columns, data }: GenericTableProps<R>) => {
	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<section css={sectionStyle}>
			<div css={tableContainerStyle}>
				<table css={tableStyle}>
					<thead css={tableHeaderStyle}>
						{table.getHeaderGroups().map((headerGroup: HeaderGroup<R>) => (
							<TableHeader key={headerGroup.id} headerGroup={headerGroup} />
						))}
					</thead>
					<tbody css={tableHeaderStyle}>
						{table.getRowModel().rows.map((row, i: number) => (
							<TableRow key={row.id} row={row} index={i} />
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default Table;

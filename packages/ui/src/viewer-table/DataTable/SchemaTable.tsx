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
import type { Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import { getCoreRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import { Lato } from '../styles/typography';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import { schemaBaseColumns } from './tableInit';

type SchemaTableProps = {
	schema: Schema;
};

const sectionStyle = css`
	margin-bottom: 48px;
	max-width: 1200px;
`;
const tableStyle = css`
	width: 100%;
	border-collapse: collapse;
	margin-top: 8px;
`;

const SchemaTable = ({ schema }: SchemaTableProps) => {
	const table = useReactTable({
		data: schema.fields || [],
		columns: schemaBaseColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<section css={sectionStyle}>
			<table css={tableStyle}>
				<thead>
					{table.getHeaderGroups().map((headerGroup: HeaderGroup<SchemaField>) => (
						<TableHeader key={headerGroup.id} headerGroup={headerGroup} />
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row, i: number) => (
						<TableRow key={row.id} row={row} index={i} />
					))}
				</tbody>
			</table>
		</section>
	);
};

export default SchemaTable;

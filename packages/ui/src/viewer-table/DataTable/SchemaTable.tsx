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
import type { Schema } from '@overture-stack/lectern-dictionary';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useThemeContext } from '../../theme/ThemeContext';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import { getSchemaBaseColumns } from './tableInit';

type SchemaTableProps = {
	schema: Schema;
};

const sectionStyle = css`
	margin-bottom: 48px;
	max-width: 1200px;
`;

const tableContainerStyle = css`
	display: flex;
	max-width: 1200px;
`;

const fixedColumnContainerStyle = css`
	flex: 0 0 300px;
`;

const scrollableColumnsContainerStyle = css`
	overflow-x: auto;
	flex: 1;
`;

const tableStyle = css`
	border-collapse: separate;
	border-spacing: 0;
	margin-top: 8px;
	width: 100%;
	td,
	th {
		vertical-align: top;
		line-height: 1.5;
	}
`;

const fixedTableStyle = css`
	${tableStyle}
	width: 300px;
`;

const scrollableTableStyle = css`
	${tableStyle}
	min-width: 800px;
`;

const thStyle = css`
	padding: 8px;
	text-align: left;
	border-bottom: 1px solid #dcdcdc;
`;

const tdStyle = css`
	padding: 8px;
	border-bottom: 1px solid #dcdcdc;
	vertical-align: top;
`;

const rowStyle = (index: number) => css`
	background-color: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};
`;

const SchemaTable = ({ schema }: SchemaTableProps) => {
	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = (text: string) => {
		if (isCopying) return;
		setIsCopying(true);
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setIsCopying(false);
				}, 2000);
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				setCopySuccess(false);
				setIsCopying(false);
			});
		if (copySuccess) {
			setClipboardContents(window.location.href);
		}
		setCopySuccess(false);
	};

	const table = useReactTable({
		data: schema.fields || [],
		columns: getSchemaBaseColumns(setClipboardContents),
		getCoreRowModel: getCoreRowModel(),
	});

	useMemo(() => {
		if (clipboardContents) {
			handleCopy(clipboardContents);
		}
	}, [clipboardContents]);

	const theme = useThemeContext();

	return (
		<section css={sectionStyle}>
			<div css={tableContainerStyle}>
				<div css={fixedColumnContainerStyle}>
					<table css={fixedTableStyle}>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableHeader key={headerGroup.id} headerGroup={headerGroup} columnSlice={[0, 1]} />
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row, i) => (
								<TableRow key={row.id} row={row} index={i} columnSlice={[0, 1]} />
							))}
						</tbody>
					</table>
				</div>

				<div css={scrollableColumnsContainerStyle}>
					<table css={scrollableTableStyle}>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableHeader key={headerGroup.id} headerGroup={headerGroup} columnSlice={[1]} />
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row, i) => (
								<TableRow key={row.id} row={row} index={i} columnSlice={[1]} />
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
};

export default SchemaTable;

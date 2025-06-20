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
import type { Dictionary, Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import { replaceReferences } from '@overture-stack/lectern-dictionary';
import { getCoreRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { getSchemaBaseColumns } from './SchemaTableInitialization/TableInit';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

type SchemaTableProps = {
	schema: Schema;
	dictionary: Dictionary;
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

const SchemaTable = ({ schema, dictionary }: SchemaTableProps) => {
	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const resolvedDictionary = replaceReferences(dictionary);

	const handleCopy = (text: string) => {
		if (isCopying) {
			return; // We don't wanna copy if we are already copying
		}
		setIsCopying(true);
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setIsCopying(false);
				}, 2000); // Reset copy success after 2 seconds as well as the isCopying state
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				setCopySuccess(false);
				setIsCopying(false);
			});
		if (copySuccess) {
			// Update the clipboard contents
			const currentURL = window.location.href;
			setClipboardContents(currentURL);
		}
		setCopySuccess(false);
	};

	const table = useReactTable({
		data: resolvedDictionary.schemas[0].fields,
		columns: getSchemaBaseColumns(setClipboardContents),
		getCoreRowModel: getCoreRowModel(),
	});
	useMemo(() => {
		if (clipboardContents) {
			handleCopy(clipboardContents);
		}
	}, [clipboardContents]);

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

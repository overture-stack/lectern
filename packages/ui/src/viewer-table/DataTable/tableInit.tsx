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
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { createColumnHelper } from '@tanstack/react-table';
import { Lato } from '../styles/typography';
// This file is responsible for defining the columns of the schema table, depending on user defined types and schemas.

const columnHelper = createColumnHelper<SchemaField>();

export const schemaBaseColumns = [
	columnHelper.accessor('name', {
		header: 'SchemaField',
		cell: (field) => {
			// TODO: Open issue in lectern to make displayName a known property of field
			return (
				<div
					css={css`
						display: flex;
						flex-direction: column;
						gap: 10px;
					`}
				>
					<div css={Lato.Paragraph_bold_small}>{field.row.original.name}</div>
					<div css={Lato.Paragraph_small}>{field.row.original.description}</div>
				</div>
			);
		},
	}),
	columnHelper.accessor(
		(row) => {
			const restrictions = row.restrictions || {};
			if ('required' in restrictions && typeof restrictions !== 'function') {
				return restrictions.required ?? false;
			}
			return false;
		},
		{
			id: 'required',
			header: 'Required',
			cell: (required) => (required.getValue() ? 'Yes' : 'No'),
		},
	),
	columnHelper.accessor('valueType', {
		header: 'Type',
		cell: (type) => {
			const { valueType, isArray, delimiter } = type.row.original;
			return (
				<div>
					{valueType}
					{isArray}
					{delimiter}
				</div>
			);
		},
	}),
	columnHelper.accessor((row) => row.meta?.examples ?? [], {
		id: 'examples',
		header: 'Examples',
		cell: (examples) => {
			const value = examples.getValue();
			return Array.isArray(value) ? value.join(',  ') : value;
		},
	}),
];

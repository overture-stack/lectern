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
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import { useThemeContext } from '../../theme/ThemeContext';
import { useEffect } from 'react';
import { Theme } from '../../theme';
// This file is responsible for defining the columns of the schema table, depending on user defined types and schemas.

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	margin-left: 8px;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors.secondary};
	&:hover {
		opacity: 1;
	}
`;
const columnHelper = createColumnHelper<SchemaField>();

const renderSchemaField = (field: CellContext<SchemaField, string>, setClipboardContents: (curr: string) => void) => {
	const theme = useThemeContext();
	const fieldName = field.row.original.name;
	const fieldIndex = field.row.index;

	// In a Dictionary, there is no such thing as an examples field, however it is commonly apart of the meta
	// due to project specs, we will render the examples here if they exist and have logic to handle it.

	const renderExamples = () => {
		const examples = field.row.original.meta?.examples;
		if (!examples) {
			return null;
		}
		// the only way we can have more than one example is if we have an array of examples

		const count = Array.isArray(examples) ? examples.length : 1;
		const label = count > 1 ? 'Examples:' : 'Example:';
		const text = Array.isArray(examples) ? examples.join(', ') : String(examples);

		return (
			<div css={theme.typography.heading}>
				{label} {text}
			</div>
		);
	};

	const { Hash } = theme.icons;

	useEffect(() => {
		const hashTarget = `field-${fieldIndex}`;
		if (window.location.hash === `#${hashTarget}`) {
			document.getElementById(hashTarget)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	const handleClick = () => {
		const hashTarget = `field-${fieldIndex}`;
		window.location.hash = `#${hashTarget}`;
		setClipboardContents(window.location.href);
	};

	return (
		<div
			id={`field-${fieldIndex}`}
			css={css`
				display: flex;
				flex-direction: column;
				gap: 10px;
			`}
		>
			<div css={theme.typography.heading}>
				{fieldName}
				<span css={hashIconStyle(theme)} onClick={handleClick}>
					<Hash width={20} height={20} fill={theme.colors.secondary} />
				</span>
			</div>
			<div css={theme.typography.heading}>{field.row.original.description}</div>
			{renderExamples()}
		</div>
	);
};

export const getSchemaBaseColumns = (setClipboardContents: (curr: string) => void) => [
	columnHelper.accessor('name', {
		header: 'Fields',
		cell: (field) => renderSchemaField(field, setClipboardContents),
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
			header: 'Attribute',
		},
	),
	columnHelper.accessor('valueType', {
		header: 'Data Type',
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

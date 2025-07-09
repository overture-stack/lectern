/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import {
	DictionaryMeta,
	DictionaryMetaValue,
	SchemaField,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { Row } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import Pill from '../../../../common/Pill';
import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';
import OpenModalPill from '../OpenModalPill';

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors.secondary};
	&:hover {
		opacity: 1;
	}
`;

const fieldContainerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 10px;
	scroll-margin: 40%;
`;

const fieldNameStyle = (theme: Theme) => css`
	${theme.typography.label}
	display: flex;
	align-items: center;
	gap: 2px;
`;

export type FieldExamplesProps = {
	examples: DictionaryMetaValue | DictionaryMeta;
	// examples: DictionaryMeta[keyof DictionaryMeta];
	// Another approach would be
	// examples: DictionaryMeta[string];
	theme: Theme;
};

export type FieldNameProps = {
	name: string;
	uniqueKeys: string[];
	index: number;
	foreignKey: string;
	theme: Theme;
};

export type FieldColumnProps = {
	fieldRow: Row<SchemaField>;
};

export type FieldDescriptionProps = {
	description: string;
	theme: Theme;
};

const useClipboard = () => {
	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = (text: string) => {
		if (isCopying) {
			return;
		}
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
			const currentURL = window.location.href;
			setClipboardContents(currentURL);
		}
		setCopySuccess(false);
	};

	useMemo(() => {
		if (clipboardContents) {
			handleCopy(clipboardContents);
		}
	}, [clipboardContents]);

	return {
		clipboardContents,
		setClipboardContents,
		isCopying,
		copySuccess,
		handleCopy,
	};
};

const FieldName = ({ name, uniqueKeys, foreignKey, theme }: FieldNameProps) => {
	return (
		<div css={fieldNameStyle(theme)}>
			{name}
			{uniqueKeys.length === 1 && !foreignKey && <Pill size="small">{uniqueKeys}</Pill>}
			{uniqueKeys.length > 1 && !foreignKey && <OpenModalPill title="Primary Key" />}
			{foreignKey && <OpenModalPill title="Foreign Key" />}
		</div>
	);
};

export const FieldsColumn = ({ fieldRow }: FieldColumnProps) => {
	const fieldName = fieldRow.original.name;
	const fieldIndex = fieldRow.index;
	const fieldDescription = fieldRow.original.description;
	const fieldExamples = fieldRow.original.meta?.examples;

	const fieldRestrictions: SchemaRestrictions = fieldRow.original.restrictions;
	// TODO: not sure why they are undefined
	const uniqueKey = fieldRestrictions && 'uniqueKey' in fieldRestrictions ? fieldRestrictions.uniqueKey : [''];
	const foreignKey = fieldRestrictions && 'foreignKey' in fieldRestrictions && fieldRestrictions.foreignKey;

	const { setClipboardContents } = useClipboard();
	const theme: Theme = useThemeContext();

	return (
		<div id={fieldIndex.toString()} css={fieldContainerStyle}>
			<FieldName
				name={fieldName}
				index={fieldIndex}
				uniqueKeys={uniqueKey as string[]}
				foreignKey={foreignKey as string}
				theme={theme}
			/>
			{fieldDescription && <p css={theme.typography.data}>{fieldDescription}</p>}
			{fieldExamples && (
				<p css={theme.typography.data}>
					<strong>Example(s): </strong>
					{Array.isArray(fieldExamples) ? fieldExamples.join(', ') : fieldExamples.toString()}
				</p>
			)}
		</div>
	);
};

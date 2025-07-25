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
import { DictionaryMeta, SchemaField } from '@overture-stack/lectern-dictionary';
import { Row } from '@tanstack/react-table';

import ReadMoreText from '../../../../common/ReadMoreText';
import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';

const fieldContainerStyle = (theme: Theme) => css`
	${theme.typography.data}
	display: flex;
	flex-direction: column;
	gap: 3px;
`;

export type FieldExamplesProps = {
	examples: DictionaryMeta[keyof DictionaryMeta];
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

/**
 * Renders the fields column cell showing field name, description, and examples.
 * @param {Row<SchemaField>} fieldRow - TanStack table row containing schema field data
 * @returns {JSX.Element} Field display with name, description, and examples in expandable text
 */

export const FieldsColumn = ({ fieldRow }: FieldColumnProps) => {
	const theme: Theme = useThemeContext();

	const fieldName = fieldRow.original.name;
	const fieldDescription = fieldRow.original.description;
	const fieldExamples = fieldRow.original.meta?.examples;

	return (
		<ReadMoreText wrapperStyle={fieldContainerStyle(theme)}>
			<b>{fieldName}</b>
			{fieldDescription && <p>{fieldDescription}</p>}
			{fieldExamples && (
				<div>
					<b>Example(s): </b>
					{Array.isArray(fieldExamples) ? fieldExamples.join(', ') : fieldExamples.toString()}
				</div>
			)}
		</ReadMoreText>
	);
};

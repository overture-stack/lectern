/*
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
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { SchemaField, SchemaFieldRestrictions, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { ReactNode } from 'react';
import ReadMoreText from '../../../../../common/ReadMoreText';
import { computeAllowedValuesColumn, type RestrictionItem } from './ComputeAllowedValues';
import { useThemeContext } from '../../../../../theme/ThemeContext';
import { Theme } from '../../../../../theme';
const allowedValuesContainerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const restrictionItemStyle = css`
	margin-top: 4px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const prefixStyle = css`
	font-weight: bold;
	line-height: 1.4;
`;

const codeListContentStyle = css`
	display: flex;
	flex-direction: column;
	gap: 2px;
	line-height: 1.4;
`;

const renderRestrictionItem = (value: RestrictionItem, key: string): ReactNode => {
	const { prefix, content } = value;
	const theme: Theme = useThemeContext();
	return (
		<div key={key} css={restrictionItemStyle}>
			<div css={prefixStyle}>{prefix.join(' ')}</div>
			{content.length > 0 && (
				<ReadMoreText wrapperStyle={() => codeListContentStyle}>
					<span
						css={css`
							whitespace: 'pre-line';
							${theme.typography.data}
						`}
					>
						{content.join('\n')}
					</span>
				</ReadMoreText>
			)}
		</div>
	);
};

export const renderAllowedValuesColumn = (
	fieldLevelRestrictions: SchemaFieldRestrictions,
	schemaLevelRestrictions: SchemaRestrictions,
	currentSchemaField: SchemaField,
) => {
	const items = computeAllowedValuesColumn(fieldLevelRestrictions, schemaLevelRestrictions, currentSchemaField);
	if (!items || Object.keys(items).length === 0) {
		return <strong>No restrictions provided for this field</strong>;
	}

	return (
		<ReadMoreText wrapperStyle={() => allowedValuesContainerStyle}>
			{Object.entries(items).map(([key, value]) => {
				return (
					value ?
						typeof value === 'object' && 'prefix' in value && 'content' in value ?
							renderRestrictionItem(value, key)
						:	<div key={key}>{value}</div>
					:	null
				);
			})}
		</ReadMoreText>
	);
};

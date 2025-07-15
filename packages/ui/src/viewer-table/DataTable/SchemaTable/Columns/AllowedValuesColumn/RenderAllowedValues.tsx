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
import { Schema, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';

import FieldBlock from '../../../../../common/FieldBlock';
import { useThemeContext } from '../../../../../theme/ThemeContext';
import { computeAllowedValuesColumn } from './ComputeAllowedValues';

const allowedValuesContainerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const restrictionItemStyle = css`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const prefixStyle = css`
	font-weight: bold;
	line-height: 1.4;
`;

const contentStyle = css`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	align-items: center;
	line-height: 1.4;
`;

export const renderAllowedValuesColumn = (
	fieldLevelRestrictions: SchemaRestrictions,
	schemaLevelRestrictions: Schema['restrictions'],
	currentSchemaField: SchemaField,
) => {
	const theme = useThemeContext();
	const items = computeAllowedValuesColumn(fieldLevelRestrictions, schemaLevelRestrictions, currentSchemaField);

	if (!items || Object.keys(items).length === 0) {
		return <strong>None</strong>;
	}

	return (
		<div css={allowedValuesContainerStyle}>
			{Object.entries(items).map(([key, value]) => {
				const { prefix, content } = value;

				if (prefix.length === content.length && !content.every((item) => item.isFieldBlock)) {
					return (
						<div key={key} css={restrictionItemStyle}>
							<div css={contentStyle}>
								{prefix.map((prefixItem, index) => (
									<span key={index}>
										<strong>{prefixItem}</strong> {content[index].content}
									</span>
								))}
							</div>
						</div>
					);
				}

				return (
					<div key={key} css={restrictionItemStyle}>
						{prefix.length > 0 && <div css={prefixStyle}>{prefix.join(' ')}</div>}

						{content.length > 0 && (
							<div css={contentStyle}>
								{content.map((item, index) => {
									if (item.isFieldBlock) {
										return <FieldBlock key={index}>{item.content}</FieldBlock>;
									}

									if (item.isBold) {
										return <strong key={index}>{item.content}</strong>;
									}

									return <span key={index}>{item.content}</span>;
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

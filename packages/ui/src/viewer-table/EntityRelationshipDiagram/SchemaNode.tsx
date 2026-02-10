/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import Key from '../../theme/icons/Key';
import { type Theme, useThemeContext } from '../../theme';
import { createFieldHandleId } from './diagramUtils';

const fieldRowStyles = css`
	padding: 12px 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: background-color 0.2s;
	position: relative;
`;

const fieldContentStyles = css`
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
`;

const fieldNameStyles = (theme: Theme) => css`
	${theme.typography.subtitleSecondary}
	font-size: 14px;
	color: #1f2937;
	line-height: 1.5;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	flex: 1;
`;

const dataTypeBadgeStyles = (theme: Theme) => css`
	${theme.typography.regular}
	font-size: 12px;
	color: #374151;
	flex-shrink: 0;

	&:first-letter {
		text-transform: uppercase;
	}
`;

const nodeContainerStyles = css`
	background: white;
	border: 1px solid black;
	border-radius: 8px;
	box-shadow:
		0 10px 20px -3px rgba(0, 0, 0, 0.30),
		0 4px 10px -2px rgba(0, 0, 0, 0.35);
	min-width: 280px;
	max-width: 350px;
	overflow: hidden;
`;

const nodeHeaderStyles = (theme: Theme) => css`
	${theme.typography.subtitleSecondary}
	background: ${theme.colors.accent};
	color: white;
	padding: 16px 24px;
	text-align: left;
	border-bottom: 1px solid black;
	letter-spacing: 0.05em;
	margin: 0;
	gap: 4px;
	display: flex;
	flex-direction: column;
	align-items: left;
`;

const nodeTitleTextStyle = css`
	font-size: 20px;
	::first-letter {
		text-transform: uppercase;
	}
`;

const nodeSubtitleTextStyle = css`
	font-size: 16px;
`;

const fieldsListStyles = css`
	background: #f8fafc;
	max-height: 350px;
	overflow-y: auto;
	& > div:nth-child(even) {
		background-color: #e5edf3;
		border-block: 1.5px solid #d4dce2;
	}
`;

const fieldNameContainerStyles = css`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const baseHandleStyles = css`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	background: transparent;
	border: none;
	width: 8px;
	height: 8px;
`;

const sourceHandleStyles = css`
	${baseHandleStyles}
	right: -10px;
`;

const targetHandleStyles = css`
	${baseHandleStyles}
	left: -10px;
`;

export function SchemaNode(props: { data: Schema }) {
	const { data: schema } = props;
	const theme = useThemeContext();

	return (
		<div css={nodeContainerStyles}>
			<div css={nodeHeaderStyles(theme)}>
				<span css={nodeTitleTextStyle}>{schema.name}</span>
				<span css={nodeSubtitleTextStyle}>Schema</span>
			</div>

			<div css={fieldsListStyles}>
				{schema.fields.map((field, index) => {
					const isUniqueKey = schema.restrictions?.uniqueKey?.includes(field.name) || field.unique === true;
					const isForeignKey =
						schema.restrictions?.foreignKey?.some((fk) =>
							fk.mappings.some((mapping) => mapping.local === field.name),
						) || false;

					const valueType = field.isArray ? `${field.valueType}[]` : field.valueType;

					return (
						<div key={index} css={fieldRowStyles}>
							<div css={fieldContentStyles}>
								<span css={fieldNameStyles(theme)}>{field.name}</span>
							</div>

							<div css={fieldNameContainerStyles}>
								{(isUniqueKey || isForeignKey) && <Key width={10} height={10} />}
								<span css={dataTypeBadgeStyles(theme)}>{valueType}</span>
							</div>

							{isUniqueKey && (
								<Handle
									id={createFieldHandleId(schema.name, field.name, 'source')}
									type="source"
									position={Position.Right}
									css={sourceHandleStyles}
								/>
							)}

							{isForeignKey && (
								<Handle
									id={createFieldHandleId(schema.name, field.name, 'target')}
									type="target"
									position={Position.Left}
									css={targetHandleStyles}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

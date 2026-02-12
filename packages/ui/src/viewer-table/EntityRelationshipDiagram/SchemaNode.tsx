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
import type { Schema } from '@overture-stack/lectern-dictionary';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import Key from '../../theme/icons/Key';
import { useThemeContext } from '../../theme';
import {
	fieldRowStyles,
	fieldContentStyles,
	fieldNameStyles,
	dataTypeBadgeStyles,
	nodeContainerStyles,
	nodeHeaderStyles,
	nodeTitleTextStyle,
	nodeSubtitleTextStyle,
	fieldsListStyles,
	fieldNameContainerStyles,
	sourceHandleStyles,
	targetHandleStyles,
} from '../../theme/emotion/schemaNodeStyles';
import { createFieldHandleId } from './diagramUtils';

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

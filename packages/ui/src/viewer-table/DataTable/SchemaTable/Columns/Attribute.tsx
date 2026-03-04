/*
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
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import type { Schema, SchemaField } from '@overture-stack/lectern-dictionary';
import { SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { useState } from 'react';

import { type Theme, useThemeContext } from '../../../../theme/index';
import Key from '../../../../theme/icons/Key';
import Eye from '../../../../theme/icons/Eye';
import { isFieldForeignKey } from '../../../../utils/isFieldForeignKey';
import { isFieldRequired } from '../../../../utils/isFieldRequired';
import { isFieldUniqueKey } from '../../../../utils/isFieldUniqueKey';
import { ConditionalLogicModal } from '../../../ConditionalLogicModal/ConditionalLogicModal';
import { NoMarginParagraph } from '../../../../theme/emotion';
import OpenModalButton from '../../../OpenModalButton';
import { useDiagramViewContext } from '../../../DiagramViewContext';

export type Attributes = 'Required' | 'Optional' | 'Required When';

const containerStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
	${theme.typography.paragraphSmallBold}
`;

const diagramLinkStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmallBold}
	padding: 0;
	background: none;
	border: none;
	color: ${theme.colors.black};
	text-decoration: underline;
	cursor: pointer;
	&:hover {
		color: ${theme.colors.secondary};
	}

`;

const hoverGroupStyle = (theme: Theme) => css`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	&:has(button:hover) svg {
		stroke: ${theme.colors.secondary};
	}
	&:has(button:hover) button {
		color: ${theme.colors.secondary};
	}
`;

const iconGroupStyle = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
`;

/**
 * Renders the attribute column cell showing field requirement status.
 * @param {SchemaFieldRestrictions} schemaFieldRestrictions - Field-level restrictions containing requirement information
 */

export const renderAttributesColumn = (
	schemaFieldRestrictions: SchemaFieldRestrictions,
	currentSchemaField?: SchemaField,
	schema?: Schema,
) => {
	const theme: Theme = useThemeContext();
	const { openFocusedDiagram } = useDiagramViewContext();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const showConditional = !!(schemaFieldRestrictions && 'if' in schemaFieldRestrictions);
	const isUniqueKey = !!(schema && currentSchemaField) && isFieldUniqueKey(schema, currentSchemaField);
	const isForeignKey = !!(schema && currentSchemaField) && isFieldForeignKey(schema, currentSchemaField);
	const isRequired = currentSchemaField && isFieldRequired(currentSchemaField);

	return (
		<div css={containerStyle(theme)}>
			{showConditional ?
				<>
					<div css={hoverGroupStyle(theme)}>
						<div css={iconGroupStyle}>
							<Eye width={24} height={24} />
							{(isUniqueKey || isForeignKey) && <Key width={18} height={18} />}
						</div>
						<OpenModalButton onClick={() => setIsOpen(true)}>
							<p css={NoMarginParagraph}>Required</p>
							<p css={NoMarginParagraph}>When</p>
						</OpenModalButton>
					</div>
					{currentSchemaField && (
						<ConditionalLogicModal
							isOpen={isOpen}
							setIsOpen={setIsOpen}
							restrictions={schemaFieldRestrictions}
							currentSchemaField={currentSchemaField}
						/>
					)}
				</>
			: isForeignKey ?
				<div css={hoverGroupStyle(theme)}>
					<Key width={18} height={18} />
					<button
						css={diagramLinkStyle(theme)}
						onClick={() =>
							schema &&
							currentSchemaField &&
							openFocusedDiagram({ schemaName: schema.name, fieldName: currentSchemaField.name })
						}
					>
						{isRequired ? 'Required' : 'Optional'}
					</button>
				</div>
			:	<>
					{isUniqueKey && <Key width={18} height={18} />}
					<div>{isRequired ? 'Required' : 'Optional'}</div>
				</>
			}
		</div>
	);
};

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
import type { SchemaField } from '@overture-stack/lectern-dictionary';
import { SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { useState } from 'react';

import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';
import { isFieldRequired } from '../../../../utils/isFieldRequired';
import { ConditionalLogicModal } from '../../../ConditionalLogicModal/ConditionalLogicModal';
import OpenModalButton from '../../../OpenModalButton';

export type Attributes = 'Required' | 'Optional' | 'Required When';

const containerStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
	${theme.typography.paragraphSmallBold}
`;

/**
 * Renders the attribute column cell showing field requirement status.
 * @param {SchemaFieldRestrictions} schemaFieldRestrictions - Field-level restrictions containing requirement information
 */

export const renderAttributesColumn = (
	schemaFieldRestrictions: SchemaFieldRestrictions,
	currentSchemaField?: SchemaField,
) => {
	const theme: Theme = useThemeContext();
	const [isOpen, setIsOpen] = useState(false);
	const showConditional = !!(schemaFieldRestrictions && 'if' in schemaFieldRestrictions);

	return (
		<div css={containerStyle(theme)}>
			{showConditional ?
				<>
					<OpenModalButton onClick={() => setIsOpen(true)}>Required When</OpenModalButton>
					{currentSchemaField && (
						<ConditionalLogicModal
							isOpen={isOpen}
							setIsOpen={setIsOpen}
							restrictions={schemaFieldRestrictions}
							currentSchemaField={currentSchemaField}
						/>
					)}
				</>
			:	<div>{currentSchemaField && isFieldRequired(currentSchemaField) ? 'Required' : 'Optional'}</div>}
		</div>
	);
};

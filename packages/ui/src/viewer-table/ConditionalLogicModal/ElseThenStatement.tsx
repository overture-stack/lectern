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
import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';

import { ConditionalStatementWrapper } from './ConditionalStatementWrapper';
import { getRestrictionType } from './utils/getRestrictionType';
import { handleConditionalRestrictions } from './utils/handleConditionalRestrictions';
import { handleSimpleRestrictions } from './utils/handleSimpleRestrictions';
import { mergeSimpleRestrictions } from './utils/mergeSimpleRestrictions';

export type ElseThenStatementProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
	statementType: 'then' | 'else';
};

/**
 * Renders the "ELSE" or "THEN" statement for conditional field restrictions
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @param statementType - The type of statement, either 'then' or 'else'
 * @returns {JSX.Element | undefined} The rendered ELSE/THEN statement component or undefined
 */
export const ElseThenStatement = ({ restrictions, currentSchemaField, statementType }: ElseThenStatementProps) => {
	const restrictionsArray = Array.isArray(restrictions) ? restrictions : [restrictions];

	const simpleRestrictions = restrictionsArray.filter((restriction) => getRestrictionType(restriction) === 'simple');

	const conditionalRestrictions = restrictionsArray.filter(
		(restriction) => getRestrictionType(restriction) === 'conditional',
	);

	const mergedSimpleRestrictions = mergeSimpleRestrictions(simpleRestrictions);

	return (
		<ConditionalStatementWrapper
			headerText={statementType === 'then' ? 'THEN' : 'ELSE'}
			isContainer={conditionalRestrictions.length > 0}
		>
			<div
				css={css`
					${conditionalRestrictions.length > 0 ? `margin-left: 44px;` : ''}
				`}
			>
				{handleSimpleRestrictions(mergedSimpleRestrictions, currentSchemaField)}
			</div>
			{conditionalRestrictions.flatMap((restriction) => handleConditionalRestrictions(restriction, currentSchemaField))}
		</ConditionalStatementWrapper>
	);
};

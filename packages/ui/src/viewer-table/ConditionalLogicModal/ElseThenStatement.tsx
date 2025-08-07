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

import { type SchemaField, type SchemaFieldRestrictions, TypeUtils } from '@overture-stack/lectern-dictionary';

import { ConditionalRestrictions } from './ConditionalRestrictions';
import { ConditionalStatementWrapper } from './ConditionalStatementWrapper';
import { SimpleRestrictions } from './SimpleRestrictions';

export type ElseThenStatementProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
	statementType: 'then' | 'else';
};

/**
 * Determines the type of field restrictions
 * @param restrictions - The field restrictions to analyze
 * @returns {'conditional' | 'simple' | undefined} The type of restrictions or undefined if invalid
 */
const getRestrictionType = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions !== undefined && typeof restrictions === 'object') {
		return 'if' in restrictions ? 'conditional' : 'simple';
	}
	return undefined;
};

/**
 * Renders the "ELSE" or "THEN" statement for conditional field restrictions
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @param statementType - The type of statement, either 'then' or 'else'
 */
export const ElseThenStatement = ({ restrictions, currentSchemaField, statementType }: ElseThenStatementProps) => {
	const restrictionsArray = TypeUtils.asArray(restrictions);

	const simpleRestrictions = restrictionsArray.filter((restriction) => getRestrictionType(restriction) === 'simple');
	const conditionalRestrictions = restrictionsArray.filter(
		(restriction) => getRestrictionType(restriction) === 'conditional',
	);

	const renderedSimpleRestrictions =
		simpleRestrictions.length > 0 ?
			<SimpleRestrictions restrictions={simpleRestrictions} currentSchemaField={currentSchemaField} />
		:	undefined;
	const renderedConditionalRestrictions =
		conditionalRestrictions.length > 0 ?
			<ConditionalRestrictions restrictions={conditionalRestrictions} currentSchemaField={currentSchemaField} />
		:	undefined;

	const headerText = statementType === 'then' ? 'THEN' : 'ELSE';

	return (
		<ConditionalStatementWrapper
			headerText={headerText}
			simpleRestrictions={renderedSimpleRestrictions}
			conditionalRestrictions={renderedConditionalRestrictions}
			isContainer={conditionalRestrictions.length > 0}
		/>
	);
};

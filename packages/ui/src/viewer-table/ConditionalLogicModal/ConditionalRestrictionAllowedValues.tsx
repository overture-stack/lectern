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

import { SchemaField, SchemaFieldRestrictions, TypeUtils } from '@overture-stack/lectern-dictionary';
import { ReactNode } from 'react';

import { ConditionStatement, ConditionalBlock } from './ConditionalBlock';
import { ElseThenStatement } from './ElseThenStatement';
import { IfStatement } from './IfStatement';

const isConditionalRestrictions = (restrictions: SchemaFieldRestrictions) => {
	return restrictions !== undefined && typeof restrictions === 'object' && 'if' in restrictions;
};

export type ConditionalRenderResult = {
	blocks: ReactNode[];
};

/**
 * Recursively renders conditional restrictions as React components
 *
 * @param restrictions - The field restrictions to process
 * @param currentSchemaField - The schema field being described
 * @returns ConditionalRenderResult with rendered blocks
 */
export const ConditionalRestrictionAllowedValues = (
	restrictions: SchemaFieldRestrictions,
	currentSchemaField: SchemaField,
): ConditionalRenderResult | undefined => {
	const restrictionsArray = TypeUtils.asArray(restrictions);

	const allBlocks = restrictionsArray.flatMap((restriction) => {
		if (isConditionalRestrictions(restriction)) {
			const ifStatement: ConditionStatement = {
				Condition: <IfStatement conditionalRestriction={restriction.if} />,
			};
			const thenStatement = {
				Condition: (
					<ElseThenStatement
						restrictions={restriction.then}
						currentSchemaField={currentSchemaField}
						statementType="then"
					/>
				),
			};
			const elseStatement = {
				Condition: (
					<ElseThenStatement
						restrictions={restriction.else}
						currentSchemaField={currentSchemaField}
						statementType="else"
					/>
				),
			};
			const conditionStatements = [ifStatement, thenStatement, elseStatement];
			return [<ConditionalBlock conditionStatements={conditionStatements} />];
		}
		return [];
	});

	return allBlocks.length > 0 ? { blocks: allBlocks } : undefined;
};

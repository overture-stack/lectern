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
import { SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';

import { RecursiveElseThenConditionRender } from './ElseThenConditionRender';
import RenderAllowedValues from './RenderAllowedValues';
import { ConditionalStatementWrapper } from './ConditionalStatementWrapper';

export type ElseStatementProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
};

const isConditionalRestrictions = (restrictions: SchemaFieldRestrictions) => {
	return restrictions !== undefined && typeof restrictions === 'object' && 'if' in restrictions;
};

const isSimpleRestrictions = (restrictions: SchemaFieldRestrictions) => {
	return restrictions !== undefined && typeof restrictions === 'object' && !('if' in restrictions);
};

export const ElseStatement = ({ restrictions, currentSchemaField }: ElseStatementProps) => {
	if (Array.isArray(restrictions)) {
		const allBlocks = restrictions.flatMap((restriction) => {
			const result = RecursiveElseThenConditionRender(restriction, currentSchemaField, 1);
			return result?.blocks || [];
		});
		if (allBlocks.length === 0) {
			return undefined;
		}
		return (
			<ConditionalStatementWrapper headerText="ELSE:" useContainer={true}>
				{allBlocks}
			</ConditionalStatementWrapper>
		);
	} else if (isConditionalRestrictions(restrictions)) {
		const renderResult = RecursiveElseThenConditionRender(restrictions, currentSchemaField, 1);
		if (!renderResult || !renderResult.blocks || renderResult.blocks.length === 0) {
			return undefined;
		}
		return (
			<ConditionalStatementWrapper headerText="ELSE:" useContainer={true}>
				{renderResult.blocks}
			</ConditionalStatementWrapper>
		);
	} else if (isSimpleRestrictions(restrictions)) {
		return (
			<ConditionalStatementWrapper headerText="ELSE" useContainer={false}>
				{RenderAllowedValues({ restrictions, currentSchemaField })}
			</ConditionalStatementWrapper>
		);
	}

	return undefined;
};

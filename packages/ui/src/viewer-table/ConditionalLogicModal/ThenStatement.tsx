/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of the
 *  GNU Affero General Public License v3.0. You should have received a copy of the
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

import { css } from '@emotion/react';
import { ConditionalStatementWrapper } from './ConditionalStatementWrapper';
import { RecursiveElseThenConditionRender } from './ElseThenConditionRender';
import RenderAllowedValues from './RenderAllowedValues';

export type ThenStatementProps = {
	restrictions: SchemaFieldRestrictions;
	currentSchemaField: SchemaField;
};

const getRestrictionType = (restrictions: SchemaFieldRestrictions) => {
	if (restrictions !== undefined && typeof restrictions === 'object') {
		return 'if' in restrictions ? 'conditional' : 'simple';
	}
	return undefined;
};

/**
 * Processes a single restriction through recursive rendering
 *
 * @param restriction - The field restriction to process
 * @param currentSchemaField - The schema field being described
 * @returns {ReactNode[] | undefined} The conditional blocks
 */
const processRestriction = (restriction: SchemaFieldRestrictions, currentSchemaField: SchemaField) => {
	const result = RecursiveElseThenConditionRender(restriction, currentSchemaField, 1);
	return result?.blocks;
};

/**
 * Handles rendering of simple field restrictions (non-conditional)
 *
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @returns {ReactNode} The rendered simple restrictions
 */
const handleSimpleRestrictions = (restrictions: SchemaFieldRestrictions, currentSchemaField: SchemaField) => {
	return RenderAllowedValues({ restrictions, currentSchemaField });
};

/**
 * Handles processing of conditional field restrictions
 *
 * @param restrictions - The field restrictions to process
 * @param currentSchemaField - The schema field being described
 * @returns {ReactNode[]} The processed conditional restrictions as React nodes
 */
const handleConditionalRestrictions = (restrictions: SchemaFieldRestrictions, currentSchemaField: SchemaField) => {
	return Array.isArray(restrictions) ?
			restrictions
				.flatMap((restriction: SchemaFieldRestrictions) => processRestriction(restriction, currentSchemaField))
				.filter((item) => item !== undefined)
		:	processRestriction(restrictions, currentSchemaField);
};

/**
 * Renders the "THEN" statement for conditional field restrictions
 *
 * @param restrictions - The field restrictions to display
 * @param currentSchemaField - The schema field being described
 * @returns {JSX.Element | undefined} The rendered THEN statement component or undefined
 */
export const ThenStatement = ({ restrictions, currentSchemaField }: ThenStatementProps) => {
	const restrictionType = getRestrictionType(restrictions);

	if (!restrictions || !restrictionType) {
		return undefined;
	}

	return (
		<ConditionalStatementWrapper headerText="THEN" isContainer={restrictionType === 'conditional'}>
			{restrictionType === 'simple' ?
				handleSimpleRestrictions(restrictions, currentSchemaField)
			:	handleConditionalRestrictions(restrictions, currentSchemaField)}
		</ConditionalStatementWrapper>
	);
};

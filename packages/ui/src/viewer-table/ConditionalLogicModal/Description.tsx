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

import type { RestrictionCondition, SchemaField, SchemaFieldRestrictions } from '@overture-stack/lectern-dictionary';
import { Fragment } from 'react';
import FieldBlock from '../../common/FieldBlock';
import { type Theme, useThemeContext } from '../../theme/index';

export type DescriptionProps = {
	schemaLevelField: SchemaField;
};

const isConditionalRestriction = (schemaFieldRestriction: SchemaFieldRestrictions) => {
	return schemaFieldRestriction && 'if' in schemaFieldRestriction && schemaFieldRestriction.if !== undefined;
};

const extractConditions = (item: SchemaFieldRestrictions): RestrictionCondition[] => {
	return item && 'if' in item && item.if.conditions ? item.if.conditions : [];
};

const descriptionStyle = (theme: Theme) => css`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	${theme.typography.paragraphSmall}
`;

/**
 * Extracts unique field names from conditional restrictions.
 * @param schemaLevelField - Schema field to extract conditional fields from
 * @returns Array of unique field names used in conditional restrictions
 */

const extractFields = (schemaLevelField: SchemaField): string[] => {
	const schemaFieldRestrictions: SchemaFieldRestrictions[] =
		Array.isArray(schemaLevelField.restrictions) ? schemaLevelField.restrictions : [schemaLevelField.restrictions];

	const conditionalRestrictions: RestrictionCondition[] = schemaFieldRestrictions
		.filter(isConditionalRestriction)
		.flatMap(extractConditions);

	return Array.from(new Set(conditionalRestrictions.map((item) => item.fields).flat()));
};

/**
 * Displays conditional logic dependencies for a schema field.
 * @param props.schemaLevelField - The schema field to analyze for conditional dependencies
 * @returns JSX element with dependency description, or empty div if none exist
 */
export const Description = ({ schemaLevelField }: DescriptionProps) => {
	const extractedFields = extractFields(schemaLevelField);
	const currentFieldName = schemaLevelField.name;
	const theme: Theme = useThemeContext();

	return (
		<div css={descriptionStyle(theme)}>
			{extractedFields.length > 0 && (
				<Fragment>
					<FieldBlock> {currentFieldName} </FieldBlock>depends on the value(s) of:
					{extractedFields.map((field, index) => (
						<Fragment key={field}>
							<FieldBlock>{field}</FieldBlock>
							{index < extractedFields.length - 2 && ','}
							{index === extractedFields.length - 2 && ' and '}
						</Fragment>
					))}
				</Fragment>
			)}
		</div>
	);
};

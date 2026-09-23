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
import {
	MatchRuleCodeList,
	MatchRuleRegex,
	RestrictionCondition,
	RestrictionRange,
	SchemaField,
	SchemaFieldRestrictions,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import { Fragment, type ReactNode } from 'react';

import FieldBlock from '../../../../../common/FieldBlock';

const restrictionItemStyle = css`
	display: flex;
	flex-direction: column;
`;

const contentStyle = css`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px;
`;

export type RestrictionItem = {
	prefix: string[];
	content: string[];
};

export type AllowedValuesBaseDisplayItem = {
	dependsOn?: ReactNode;
	regularExpression?: ReactNode;
	codeList?: RestrictionItem;
	range?: RestrictionItem | ReactNode;
	codeListWithCountRestrictions?: RestrictionItem;
	entityRelationships?: ReactNode;
	uniqueKey?: ReactNode;
	unique?: RestrictionItem;
};

export type AllowedValuesColumnProps = {
	restrictions: CellContext<SchemaField, SchemaRestrictions>;
};

/**
 * Processes range restriction values and formats them for display.
 *
 * @param range {RestrictionRange} - The range restriction object containing min, max, exclusiveMin, exclusiveMax values
 *
 * @returns {ReactNode} A fragment with formatted range restrictions
 *
 * @example
 * // For range { min: 0, max: 100 }
 * // Returns: <Fragment>Minimum: 0 and Maximum: 100</Fragment>
 */
const handleRange = (range: RestrictionRange): ReactNode => {
	const computeRestrictions = [
		{
			condition: range.min !== undefined,
			prefix: 'Minimum:',
			content: `${range.min}`,
		},
		{
			condition: range.exclusiveMin !== undefined,
			prefix: 'Greater than:',
			content: `${range.exclusiveMin}`,
		},
		{
			condition: range.max !== undefined,
			prefix: 'Maximum:',
			content: `${range.max}`,
		},
		{
			condition: range.exclusiveMax !== undefined,
			prefix: 'Less than:',
			content: `${range.exclusiveMax}`,
		},
	];

	const computedRestrictionItems = computeRestrictions.filter((item) => item.condition);

	if (computedRestrictionItems.length === 0) {
		return undefined;
	}

	return (
		<Fragment>
			{computedRestrictionItems.map((item, index) => (
				<Fragment key={item.prefix}>
					{index > 0 && ' and '}
					<b>{item.prefix}</b> {item.content}
				</Fragment>
			))}
		</Fragment>
	);
};

/**
 * Handles code list restrictions with count-based limitations for array fields.
 * Determines the appropriate prefix text based on count restrictions and field array properties.
 *
 * @param codeList {MatchRuleCodeList | string} - A list of allowed values
 * @param count {RestrictionRange} - The count restriction object or number specifying selection limits
 * @param currentSchemaField {SchemaField} - The schema field being processed, used for array/delimiter info
 * @returns {RestrictionItem | undefined} A RestrictionItem with appropriate prefix and content, or undefined if no valid restrictions
 *
 * Flow:
 * 1. Determines delimiter text based on field's isArray property
 * 2. Evaluates count restrictions in priority order (exact count, range, min/max, exclusive bounds)
 * 3. Returns formatted restriction with contextual prefix text
 */
const handleCodeListsWithCountRestrictions = (
	codeList: MatchRuleCodeList | string,
	count: RestrictionRange,
	currentSchemaField: SchemaField,
): RestrictionItem | undefined => {
	const { isArray, delimiter } = currentSchemaField;
	const delimiterText = isArray ? `, delimited by "${delimiter}"` : '';

	const computeRestrictions = [
		{
			condition: typeof count == 'number',
			prefix: `Exactly ${count}${delimiterText} from:`,
		},
		{
			condition: count.min !== undefined && count.max !== undefined,
			prefix: `Select ${count.min} to ${count.max}${delimiterText} from:`,
		},
		{
			condition: count.min !== undefined,
			prefix: `At least ${count.min}${delimiterText} from:`,
		},
		{
			condition: count.max !== undefined,
			prefix: `Up to ${count.max}${delimiterText} from:`,
		},
		{
			condition: count.exclusiveMin !== undefined,
			prefix: `More than ${count.exclusiveMin}${delimiterText} from:`,
		},
		{
			condition: count.exclusiveMax !== undefined,
			prefix: `Fewer than ${count.exclusiveMax}${delimiterText} from:`,
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem ?
			{
				prefix: [computedRestrictionItem.prefix],
				content: Array.isArray(codeList) ? codeList.map((item: string | number) => `${item}`) : [`${codeList}`],
			}
		:	{
				prefix: [],
				content: [],
			};
};

/**
 * Processes conditional field dependencies and renders them as field blocks.
 *
 * @param conditions {RestrictionCondition[]} - Array of restriction conditions containing field dependencies
 */
const handleDependsOn = (conditions: RestrictionCondition[]): ReactNode => {
	const allFields = Array.from(new Set(conditions.flatMap((condition: RestrictionCondition) => condition.fields)));

	if (allFields.length === 0) {
		return null;
	}

	return (
		<div css={restrictionItemStyle}>
			<b>Depends on:</b>
			<div css={contentStyle}>
				{allFields.map((field) => (
					<FieldBlock key={field}>{field}</FieldBlock>
				))}
			</div>
		</div>
	);
};

/**
 * Formats regular expression pattern restrictions for display.
 * Handles both single patterns and arrays of patterns.
 *
 * @param regularExpression {MatchRuleRegex} - Single regex pattern string or array of patterns
 */
const handleRegularExpression = (regularExpression: MatchRuleRegex) => {
	const patterns = Array.isArray(regularExpression) ? regularExpression : [regularExpression];

	return (
		<Fragment>
			<b>{Array.isArray(regularExpression) ? 'Must match patterns:' : 'Must match pattern:'}</b>
			<div css={contentStyle}>
				{patterns.map((pattern) => (
					<FieldBlock key={pattern}>{pattern}</FieldBlock>
				))}
			</div>
		</Fragment>
	);
};

/**
 * Formats simple code list restrictions without count limitations.
 *
 * @param codeList {MatchRuleCodeList | string} - The allowed value(s)
 * @returns {RestrictionItem} A RestrictionItem with "One of:" prefix and formatted content values
 *
 * @example
 * // For codeList: ["red", "green", "blue"]
 * // Returns: { prefix: ["One of:"], content: ["red", "green", "blue"] }
 */
const handleCodeList = (codeList: MatchRuleCodeList | string): RestrictionItem => {
	return {
		prefix: ['One of:'],
		content: Array.isArray(codeList) ? codeList.map((item) => `${item}`) : [`${codeList}`],
	};
};

/**
 * Renders the foreign key constraint description for a field.
 * Renders one description per foreign key restriction the field participates in.
 * For compound foreign keys, notes the other local fields involved in the joint constraint.
 *
 * @param foreignKeys - The foreignKey restrictions from the schema
 * @param currentFieldName - The name of the field being rendered
 */
const handleForeignKeys = (
	foreignKeys: SchemaRestrictions['foreignKey'],
	currentFieldName: string,
): ReactNode => {
	if (!foreignKeys) {
		return undefined;
	}

	const filteredForeignKeys = foreignKeys.flatMap((foreignKey) =>
		foreignKey.mappings
			.filter((mapping) => mapping.local === currentFieldName)
			.map((mapping) => ({ foreignKey, mapping })),
	);

	if (filteredForeignKeys.length === 0) {
		return undefined;
	}

	return (
		<Fragment>
			{filteredForeignKeys.map(({ foreignKey, mapping }) => {
				const otherMappings = foreignKey.mappings.filter((foreignKeyMapping) => foreignKeyMapping.local !== currentFieldName);
				return (
					<span key={foreignKey.schema}>
						Must reference an existing <FieldBlock>{mapping.foreign}</FieldBlock> in the{' '}
						<b>{foreignKey.schema}</b> schema.
						{otherMappings.length > 0 && (
							<> The matched record must also match:{' '}
								{otherMappings.map((foreignKeyMapping) => (
									<FieldBlock key={foreignKeyMapping.local}>{foreignKeyMapping.local}</FieldBlock>
								))}
							.</>
						)}
					</span>
				);
			})}
		</Fragment>
	);
};

/**
 * Renders the unique key constraint description for a field.
 *
 * Cases handled:
 * - Field is the sole unique key for the schema (basic unique key)
 * - Field is part of a compound unique key (must be unique in combination with other fields)
 *
 * @param uniqueKeys - The uniqueKey restriction from the schema
 * @param currentFieldName - The name of the field being rendered
 */
const handleUniqueKey = (uniqueKeys: SchemaRestrictions['uniqueKey'], currentFieldName: string): ReactNode => {
	if (!Array.isArray(uniqueKeys) || !uniqueKeys.includes(currentFieldName)) {
		return undefined;
	}

	if (uniqueKeys.length === 1) {
		return <span>This field is the unique identifier for each record.</span>;
	}

	return (
		<span>
			Must be unique in combination with:{' '}
			{uniqueKeys.filter((key) => key !== currentFieldName).map((key) => <FieldBlock key={key}>{key}</FieldBlock>)}
		</span>
	);
};

/**
 * Main orchestrator function that determines which restrictions apply to a field and formats them for display.
 * Processes restrictions in priority order: entity relationships, unique constraints, then field-level restrictions.
 *
 * @param fieldLevelRestrictions {SchemaFieldRestrictions} - Field-specific restrictions
 * @param schemaLevelRestrictions {SchemaRestrictions} - Schema-wide restrictions (uniqueKey, foreignKey)
 * @param currentSchemaField {SchemaField} - The current schema field that is being processed
 * @returns {AllowedValuesBaseDisplayItem} An AllowedValuesBaseDisplayItem containing formatted restriction components
 *
 * Processing Priority:
 * 1. Entity relationships (foreign/unique keys) - if present, returns immediately as user can refer to specified field
 * 2. Field-level unique constraints
 * 3. Field-level restrictions
 *
 * @example
 * // For a field with regex restriction:
 * // Returns: { regularExpression: {...} }
 *
 * // For a field with foreign key relationship:
 * // Returns: { entityRelationships: <ReactNode> } (other restrictions ignored, since the user can refer to the specified field)
 */
export const computeAllowedValuesColumn = (
	fieldLevelRestrictions: SchemaFieldRestrictions,
	schemaLevelRestrictions: SchemaRestrictions,
	currentSchemaField: SchemaField,
): AllowedValuesBaseDisplayItem => {
	const allowedValuesBaseDisplayItem: AllowedValuesBaseDisplayItem = {};

	if (schemaLevelRestrictions?.foreignKey !== undefined || schemaLevelRestrictions?.uniqueKey !== undefined) {
		const foreignKeyNode = handleForeignKeys(schemaLevelRestrictions.foreignKey, currentSchemaField.name);
		const uniqueKeyNode = handleUniqueKey(schemaLevelRestrictions.uniqueKey, currentSchemaField.name);

		if (foreignKeyNode !== undefined) {
			allowedValuesBaseDisplayItem.entityRelationships = foreignKeyNode;
		}
		if (uniqueKeyNode !== undefined) {
			allowedValuesBaseDisplayItem.uniqueKey = uniqueKeyNode;
		}
		if (foreignKeyNode !== undefined || uniqueKeyNode !== undefined) {
			return allowedValuesBaseDisplayItem;
		}
	}

	if (
		(currentSchemaField.unique === true &&
			Array.isArray(schemaLevelRestrictions?.uniqueKey) &&
			schemaLevelRestrictions?.uniqueKey?.length === 1 &&
			schemaLevelRestrictions?.uniqueKey[0] === currentSchemaField.name) ||
		currentSchemaField.unique === true
	) {
		allowedValuesBaseDisplayItem.unique = {
			prefix: ['Must have a unique value'],
			content: [],
		};
	}

	if (fieldLevelRestrictions !== undefined) {
		if (
			'if' in fieldLevelRestrictions &&
			fieldLevelRestrictions.if !== undefined &&
			fieldLevelRestrictions.if.conditions !== undefined
		) {
			allowedValuesBaseDisplayItem.dependsOn = handleDependsOn(fieldLevelRestrictions.if.conditions);
		}

		if ('regex' in fieldLevelRestrictions && fieldLevelRestrictions.regex !== undefined) {
			allowedValuesBaseDisplayItem.regularExpression = handleRegularExpression(fieldLevelRestrictions.regex);
		}

		if (
			'codeList' in fieldLevelRestrictions &&
			fieldLevelRestrictions.codeList !== undefined &&
			!('count' in fieldLevelRestrictions)
		) {
			allowedValuesBaseDisplayItem.codeList = handleCodeList(fieldLevelRestrictions.codeList);
		}

		if ('range' in fieldLevelRestrictions && fieldLevelRestrictions.range !== undefined) {
			allowedValuesBaseDisplayItem.range = handleRange(fieldLevelRestrictions.range);
		}

		if (
			'codeList' in fieldLevelRestrictions &&
			fieldLevelRestrictions.codeList !== undefined &&
			'count' in fieldLevelRestrictions &&
			fieldLevelRestrictions.count != undefined &&
			currentSchemaField.isArray !== undefined
		) {
			allowedValuesBaseDisplayItem.codeListWithCountRestrictions = handleCodeListsWithCountRestrictions(
				fieldLevelRestrictions.codeList,
				fieldLevelRestrictions.count,
				currentSchemaField,
			);
		}
	}
	return allowedValuesBaseDisplayItem;
};

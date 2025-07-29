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
import { Fragment, ReactNode } from 'react';

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
	regularExpression?: RestrictionItem;
	codeList?: RestrictionItem;
	range?: RestrictionItem | ReactNode;
	codeListWithCountRestrictions?: RestrictionItem;
	entityRelationships?: ReactNode;
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
 * @returns {ReactNode} A React component showing dependent fields
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
 * @returns {RestrictionItem} A RestrictionItem with appropriate singular/plural prefix and pattern content
 *
 * @example
 * // For single pattern: "^[A-Z]+$"
 * // Returns: { prefix: ["Must match pattern:"], content: ["^[A-Z]+$"] }
 *
 * // For multiple patterns: ["^[A-Z]+$", "^[0-9]+$"]
 * // Returns: { prefix: ["Must match patterns:"], content: ["^[A-Z]+$", "^[0-9]+$"] }
 */
const handleRegularExpression = (regularExpression: MatchRuleRegex): RestrictionItem => {
	const patterns = Array.isArray(regularExpression) ? regularExpression : [regularExpression];

	return {
		prefix: Array.isArray(regularExpression) ? ['Must match patterns:'] : ['Must match pattern:'],
		content: patterns,
	};
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
 * Processes unique key and foreign key relationships for entity relationship constraints.
 * Handles complex scenarios including compound keys, multiple schema references, and unique constraints.
 *
 * @param restrictions {Schema['restrictions']} - Schema-level restrictions containing uniqueKey and foreignKey definitions
 * @param currentSchemaField {SchemaField} - The field being processed for relationship constraints
 * @returns {ReactNode} React content describing the relationship constraint, or undefined if no constraints apply
 *
 * Process:
 * 1. Extracts unique keys and foreign keys from schema restrictions
 * 2. Finds foreign key mappings that reference the current field
 * 3. Determines constraint type in priority order:
 *    - Multiple schema references (field references multiple schemas)
 *    - Compound foreign keys (multi-field relationship)
 *    - Basic unique foreign key (single field, unique reference)
 *    - Non-unique foreign key (single field, multiple references allowed)
 *    - Compound unique key (field must be unique in combination with others)
 * 4. Returns appropriate descriptive text with schema and field references
 */
const handleKeys = (restrictions: SchemaRestrictions, currentSchemaField: SchemaField): ReactNode => {
	const uniqueKeys = restrictions?.uniqueKey;
	const foreignKeys = restrictions?.foreignKey;
	const found = foreignKeys?.flatMap((foreignKey) =>
		foreignKey.mappings
			.filter((mapping) => mapping.local === currentSchemaField.name)
			.map((mapping) => ({ foreignKey, mapping })),
	);

	const relevantForeignKeys = found?.map((item) => item.foreignKey);

	const isBasicUniqueKey =
		Array.isArray(uniqueKeys) && uniqueKeys.length === 1 && uniqueKeys[0] === currentSchemaField.name;

	const isCompoundUniqueKey =
		Array.isArray(uniqueKeys) && uniqueKeys.length > 1 && uniqueKeys.includes(currentSchemaField.name);

	const compoundForeignKey = foreignKeys?.find(
		(foreignKey) =>
			foreignKey.mappings.length > 1 &&
			foreignKey.mappings.some((mapping) => mapping.local === currentSchemaField.name),
	);

	const multipleSchemaReferences =
		found && found.length > 1 ?
			{
				field: currentSchemaField.name,
				associatedSchemas: relevantForeignKeys?.map((item) => item.schema),
			}
		:	undefined;

	const associatedSchemas = multipleSchemaReferences?.associatedSchemas;
	const associatedField = multipleSchemaReferences?.field;

	const computeRestrictions = [
		{
			condition: multipleSchemaReferences !== undefined,
			content: (
				<span>
					Must reference an existing <FieldBlock>{associatedField}</FieldBlock> within the{' '}
					<b>
						{associatedSchemas && associatedSchemas.length > 1 ?
							associatedSchemas.slice(0, -1).join(', ') + ' and ' + associatedSchemas.slice(-1)
						:	associatedSchemas?.[0]}
					</b>{' '}
					schemas.
				</span>
			),
		},
		{
			condition: compoundForeignKey !== undefined,
			content: (
				<span>
					Must reference an existing combination of:{' '}
					<span
						css={css`
							display: inline-flex;
							gap: 2px;
						`}
					>
						{compoundForeignKey?.mappings.map((mapping) => (
							<FieldBlock key={mapping.local}>{mapping.local}</FieldBlock>
						))}
					</span>{' '}
					as defined in the <b>{compoundForeignKey?.schema}</b> schema.
				</span>
			),
		},
		{
			condition: isBasicUniqueKey && relevantForeignKeys && relevantForeignKeys.length === 1,
			content: (
				<span>
					Must reference an existing: <FieldBlock>{currentSchemaField.name}</FieldBlock> as defined in the{' '}
					<b>{relevantForeignKeys?.[0]?.schema}</b> schema. Each record can only reference one{' '}
					<b>{relevantForeignKeys?.[0]?.schema}</b>.
				</span>
			),
		},
		{
			condition: !isBasicUniqueKey && relevantForeignKeys && relevantForeignKeys.length === 1,
			content: (
				<span>
					Must reference an existing: <FieldBlock>{currentSchemaField.name}</FieldBlock> as defined in the{' '}
					<b>{relevantForeignKeys?.[0]?.schema}</b> schema. Multiple records can reference the same{' '}
					<b>{relevantForeignKeys?.[0]?.schema}</b>.
				</span>
			),
		},
		{
			condition: isCompoundUniqueKey,
			content: (
				<span>
					Must be unique in combination with:{' '}
					{uniqueKeys
						?.filter((key) => key !== currentSchemaField.name)
						.map((key) => <FieldBlock key={key}>{key}</FieldBlock>)}
				</span>
			),
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem?.content;
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
		const entityRelationships = handleKeys(schemaLevelRestrictions, currentSchemaField);
		if (entityRelationships) {
			allowedValuesBaseDisplayItem.entityRelationships = entityRelationships;
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
			prefix: ['A unique value that matches the following restrictions'],
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

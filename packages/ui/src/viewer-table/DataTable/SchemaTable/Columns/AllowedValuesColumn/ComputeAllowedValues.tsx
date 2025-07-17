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
	RestrictionCondition,
	RestrictionRange,
	Schema,
	SchemaField,
	SchemaFieldRestrictions,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import { ReactNode } from 'react';

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

const inlineTextStyle = css`
	display: inline;
	margin: 0;
	padding: 0;
`;

export type RestrictionItem = {
	prefix: string[];
	content: string[];
};

export type RestrictionField = RestrictionItem | ReactNode | undefined;

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

const handleRange = (range: RestrictionRange): RestrictionItem | ReactNode => {
	if (range.min !== undefined && range.max !== undefined) {
		return (
			<div css={restrictionItemStyle}>
				<div css={contentStyle}>
					<span>
						<b>Min:</b> {range.min}
					</span>
					<span>
						<b>Max:</b> {range.max}
					</span>
				</div>
			</div>
		);
	}

	const computeRestrictions = [
		{
			condition: range.min !== undefined,
			prefix: 'Min:',
			content: `${range.min}`,
		},
		{
			condition: range.max !== undefined,
			prefix: 'Max:',
			content: `${range.max}`,
		},
		{
			condition: range.exclusiveMin !== undefined,
			prefix: 'Greater than:',
			content: `${range.exclusiveMin}`,
		},
		{
			condition: range.exclusiveMax !== undefined,
			prefix: 'Less than:',
			content: `${range.exclusiveMax}`,
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem ?
			{
				prefix: [computedRestrictionItem.prefix],
				content: [computedRestrictionItem.content],
			}
		:	{
				prefix: [],
				content: [],
			};
};

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
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

const handleDependsOn = (conditions: RestrictionCondition[]): ReactNode => {
	const allFields = Array.from(new Set(conditions.flatMap((condition: RestrictionCondition) => condition.fields)));

	if (allFields.length === 0) {
		return null;
	}

	return (
		<div css={restrictionItemStyle}>
			<b>Depends on:</b>
			<div css={contentStyle}>
				{allFields.map((field, index) => (
					<FieldBlock key={index}>{field}</FieldBlock>
				))}
			</div>
		</div>
	);
};

const handleRegularExpression = (regularExpression: string[] | string): RestrictionItem => {
	const patterns = Array.isArray(regularExpression) ? regularExpression : [regularExpression];

	return {
		prefix: Array.isArray(regularExpression) ? ['Must match patterns:'] : ['Must match pattern:'],
		content: patterns,
	};
};

const handleCodeList = (codeList: string | string[] | number[]): RestrictionItem => {
	return {
		prefix: ['One of:'],
		content: Array.isArray(codeList) ? codeList.map((item) => `${item}`) : [`${codeList}`],
	};
};

const handleKeys = (restrictions: Schema['restrictions'], currentSchemaField: SchemaField): ReactNode => {
	const uniqueKeys = restrictions?.uniqueKey;
	const foreignKeys = restrictions?.foreignKey;

	const found = foreignKeys?.flatMap((foreignKey) =>
		foreignKey.mappings
			.filter((mapping) => mapping.local === currentSchemaField.name)
			.map((mapping) => ({ foreignKey, mapping })),
	);
	const relevantForeignKeys = found?.map((item) => item.foreignKey);
	const relevantMappings = found?.map((item) => item.mapping);
	const multipleSchemaReferences =
		found && found?.length > 1 ?
			{
				field: currentSchemaField.name,
				associatedSchemas: relevantForeignKeys?.map((item) => item.schema),
			}
		:	undefined;

	const computeRestrictions = [
		{
			condition:
				relevantForeignKeys && relevantForeignKeys.length > 1 && relevantMappings && relevantMappings.length > 1,
			content: (
				<div css={contentStyle}>
					<b>Must reference an existing </b>
					<FieldBlock>{multipleSchemaReferences?.field}</FieldBlock>
					<span> within the </span>
					<b>{multipleSchemaReferences?.associatedSchemas?.join(', ')}</b>
					<span> schemas.</span>
				</div>
			),
		},
		{
			condition:
				relevantForeignKeys && relevantForeignKeys.length === 1 && relevantMappings && relevantMappings.length > 1,
			content: (
				<div css={contentStyle}>
					<b>Must reference an existing combination of: </b>
					{relevantMappings?.map((mapping, index) => (
						<span key={index} css={contentStyle}>
							<FieldBlock>{currentSchemaField.name}</FieldBlock>
							<span> as defined in the </span>
							<b>{relevantForeignKeys?.[index]?.schema}</b>
							<span> schema{index < relevantMappings.length - 1 ? ',' : '.'}</span>
						</span>
					))}
				</div>
			),
		},
		{
			condition:
				relevantForeignKeys && relevantForeignKeys.length === 1 && relevantMappings && relevantMappings.length === 1,
			content: (
				<div css={contentStyle}>
					<b>Must reference an existing </b>
					<FieldBlock>{currentSchemaField.name}</FieldBlock>
					<span> as defined in the</span>
					<b>{relevantForeignKeys?.[0]?.schema}</b>
					<span>schema. Multiple sequencing records can reference the same </span>
					<b>{relevantForeignKeys?.[0]?.schema}</b>
				</div>
			),
		},
		{
			condition:
				uniqueKeys !== undefined &&
				uniqueKeys?.length === 1 &&
				relevantForeignKeys &&
				relevantForeignKeys.length > 0 &&
				relevantMappings &&
				relevantMappings.length > 0,
			content: (
				<div css={contentStyle}>
					<b>Must reference an existing: </b>
					{relevantForeignKeys?.map((foreignKey, index) => (
						<span key={index} css={contentStyle}>
							<FieldBlock>{currentSchemaField.name}</FieldBlock>
							<span> as defined in the </span>
							<b>{foreignKey?.schema}</b>
							<span> schema. Each record can only reference one </span>
							<b>{foreignKey?.schema}</b>
						</span>
					))}
				</div>
			),
		},
		{
			condition: uniqueKeys !== undefined && uniqueKeys?.length > 1,
			content: (
				<div css={contentStyle}>
					<b>Must be unique in combination with: </b>
					{uniqueKeys
						?.filter((key) => key !== currentSchemaField.name)
						?.map((key, index) => (
							<span key={index}>
								<FieldBlock>{key}</FieldBlock>
							</span>
						))}
				</div>
			),
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem?.content || undefined;
};

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
		currentSchemaField.unique === true ||
		(Array.isArray(schemaLevelRestrictions?.uniqueKey) &&
			schemaLevelRestrictions?.uniqueKey?.length === 1 &&
			schemaLevelRestrictions?.uniqueKey[0] === currentSchemaField.name)
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

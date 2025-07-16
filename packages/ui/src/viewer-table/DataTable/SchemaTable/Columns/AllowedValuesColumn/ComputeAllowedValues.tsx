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
						<strong>Min:</strong> {range.min}
					</span>
					<span>
						<strong>Max:</strong> {range.max}
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
				content: Array.isArray(codeList) ? codeList.map((item) => `${item}`) : [`${codeList}`],
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
			<strong>Depends on:</strong>
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
	const isUnique = currentSchemaField.unique === true;
	const uniqueKeys = restrictions?.uniqueKey;
	const foreignKeys = restrictions?.foreignKey;

	const found = foreignKeys
		?.flatMap((foreignKey) =>
			foreignKey.mappings
				.filter((mapping) => mapping.local === currentSchemaField.name)
				.map((mapping) => ({ foreignKey, mapping })),
		)
		.find((item) => !!item);
	// not all of the foreign keys are relevant to the current field, hence we will take the first value and use that
	const relevantForeignKey = found?.foreignKey; // foreign key that references the current field
	const relevantMapping = found?.mapping; // mapping within that foreign key that references the current field

	const computeRestrictions = [
		{
			condition:
				isUnique && Array.isArray(uniqueKeys) && uniqueKeys?.length === 1 && uniqueKeys[0] === currentSchemaField.name,
			content: (
				<div css={restrictionItemStyle}>
					<strong>A unique value that matches the following restrictions:</strong>
				</div>
			),
		},
		{
			condition: relevantForeignKey !== undefined && relevantMapping !== undefined && relevantMapping.local.length > 1,
			content: (
				<div css={restrictionItemStyle}>
					<strong>Must reference an existing combination of:</strong>
					<div css={contentStyle}>
						<FieldBlock>{relevantMapping?.foreign}</FieldBlock>
						<span>
							<p css={inlineTextStyle}>as defined in the </p>
							<strong>{relevantForeignKey?.schema} </strong>
							<p css={inlineTextStyle}>schema.</p>
						</span>
					</div>
				</div>
			),
		},
		{
			condition:
				relevantForeignKey !== undefined && relevantMapping !== undefined && relevantMapping.local.length === 1,
			content: (
				<div css={restrictionItemStyle}>
					<strong>Must reference an existing:</strong>
					<div css={contentStyle}>
						<FieldBlock>{relevantForeignKey?.schema}</FieldBlock>
						<p>as defined in the </p>
						<strong>{relevantForeignKey?.schema} </strong>
						<p>schema. Multiple sequencing records can reference the same {relevantForeignKey?.schema}</p>
					</div>
				</div>
			),
		},
		{
			condition:
				uniqueKeys !== undefined &&
				uniqueKeys?.length === 1 &&
				relevantForeignKey !== undefined &&
				relevantMapping !== undefined &&
				relevantMapping.local.length === 1,
			content: (
				<div css={restrictionItemStyle}>
					<strong>Must reference an existing:</strong>
					<div css={contentStyle}>
						<FieldBlock>{relevantForeignKey?.schema}</FieldBlock>
						<p>as defined in the </p>
						<strong>{relevantForeignKey?.schema} </strong>
						<p>schema. Each record can only reference one </p>
						<strong>{relevantForeignKey?.schema}</strong>
					</div>
				</div>
			),
		},
		{
			condition: uniqueKeys !== undefined && uniqueKeys?.length > 1,
			content: (
				<div css={restrictionItemStyle}>
					<strong>Must be unique in combination with:</strong>
					<div css={contentStyle}>
						{uniqueKeys
							?.filter((key) => key !== currentSchemaField.name)
							?.map((key, index) => <FieldBlock key={index}>{key}</FieldBlock>)}
					</div>
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
		}
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

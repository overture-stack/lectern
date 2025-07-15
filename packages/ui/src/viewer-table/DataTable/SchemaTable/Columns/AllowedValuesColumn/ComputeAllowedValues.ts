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
import {
	RestrictionCondition,
	RestrictionRange,
	Schema,
	SchemaField,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

export type Content = {
	isFieldBlock?: boolean;
	content: string;
	isBold?: boolean;
};
export type RestrictionItem = {
	prefix: string[];
	content: Content[];
};

export type RestrictionField = RestrictionItem | undefined;

export type AllowedValuesBaseDisplayItem = {
	dependsOn?: RestrictionItem;
	regularExpression?: RestrictionItem;
	codeList?: RestrictionItem;
	range?: RestrictionItem;
	codeListWithCountRestrictions?: RestrictionItem;
	unique?: RestrictionItem;
	entityRelationships?: RestrictionItem;
};

export type AllowedValuesColumnProps = {
	restrictions: CellContext<SchemaField, SchemaRestrictions>;
};

//Helper functions
const handleRange = (range: RestrictionRange): RestrictionItem | undefined => {
	const computeRestrictions = [
		{
			condition: range.min !== undefined && range.max !== undefined,
			prefix: ['Min:', 'Max:'],
			content: [{ content: `${range.min}` }, { content: `${range.max}` }],
		},
		{
			condition: range.min !== undefined,
			prefix: 'Min:',
			content: { content: `${range.min}` },
		},
		{
			condition: range.max !== undefined,
			prefix: 'Max:',
			content: { content: `${range.max}` },
		},
		{
			condition: range.exclusiveMin !== undefined,
			prefix: 'Greater than:',
			content: { content: `${range.exclusiveMin}` },
		},
		{
			condition: range.exclusiveMax !== undefined,
			prefix: 'Less than:',
			content: { content: `${range.exclusiveMax}` },
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);

	return computedRestrictionItem ?
			{
				prefix:
					Array.isArray(computedRestrictionItem.prefix) ?
						[...computedRestrictionItem.prefix]
					:	[computedRestrictionItem.prefix],
				content:
					Array.isArray(computedRestrictionItem.content) ?
						[...computedRestrictionItem.content]
					:	[computedRestrictionItem.content],
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
				content:
					Array.isArray(codeList) ?
						codeList.map((item: string | number) => ({ content: `${item}` }))
					:	[{ content: `${codeList}` }],
			}
		:	{
				prefix: [],
				content: [],
			};
};

const handleDependsOn = (conditions: RestrictionCondition[]): RestrictionItem | undefined => {
	const allFields: Content[] = Array.from(
		new Set(conditions.flatMap((condition: RestrictionCondition) => condition.fields)),
	).map((field) => ({ content: field, isFieldBlock: true }));

	return allFields.length > 0 ?
			{
				prefix: ['Depends on:'],
				content: allFields,
			}
		:	{
				prefix: [],
				content: [],
			};
};

const handleRegularExpression = (regularExpression: string[] | string): RestrictionItem => {
	// normalize to array, then wrap each pattern in a Content
	const patterns = (Array.isArray(regularExpression) ? regularExpression : [regularExpression]).map((pattern) => ({
		content: pattern,
	}));

	return {
		prefix: Array.isArray(regularExpression) ? ['Must match patterns:'] : ['Must match pattern:'],
		content: patterns,
	};
};

const handleCodeList = (codeList: string | string[] | number[]): RestrictionItem => {
	return {
		prefix: ['One of:'],
		content:
			Array.isArray(codeList) ?
				codeList.map((item: string | number) => ({ content: `${item}` }))
			:	[{ content: `${codeList}` }],
	};
};

const handleKeys = (
	restrictions: Schema['restrictions'],
	currentSchemaField: SchemaField,
): RestrictionItem | undefined => {
	const isUnique = currentSchemaField.unique === true;
	const uniqueKeys = restrictions?.uniqueKey;
	const foreignKey = restrictions?.foreignKey;
	const computeRestrictions = [
		{
			condition:
				isUnique && Array.isArray(uniqueKeys) && uniqueKeys?.length === 1 && uniqueKeys[0] === currentSchemaField.name,
			prefix: ['A unique value that matches the following restrictions:'],
			content: [],
		},
		{
			condition: foreignKey !== undefined && foreignKey?.[0].mappings?.length > 1,
			prefix: ['Must reference an existing combination of:'],
			content: [
				...(foreignKey?.[0].mappings?.map((mapping) => ({
					content: `${mapping.foreign}`,
					isFieldBlock: true,
				})) ?? []),
				{
					content: `as defined in the ${foreignKey?.[0].schema} schema.`,
				},
			],
		},
		{
			condition: foreignKey !== undefined && foreignKey[0].mappings?.length === 1,
			prefix: ['Must reference an existing:'],
			content: [
				{ content: `${foreignKey?.[0]?.schema}`, isFieldBlock: true },
				{
					content: 'as defined in the ',
				},
				{
					content: `${foreignKey?.[0].schema} `,
					isBold: true,
				},
				{
					content: `schema. Multiple sequencing records can reference the same ${foreignKey?.[0].schema}`,
				},
			],
		},
		{
			condition:
				uniqueKeys !== undefined &&
				uniqueKeys?.length === 1 &&
				foreignKey !== undefined &&
				foreignKey[0].mappings?.length === 1,
			prefix: ['Must reference an existing:'],
			content: [
				{ content: `${foreignKey?.[0].schema}`, isFieldBlock: true },
				{
					content: `as defined in the ${foreignKey?.[0].schema} schema. Each record can only reference one ${foreignKey?.[0]?.schema}`,
				},
			],
		},
		{
			condition: uniqueKeys !== undefined && uniqueKeys?.length > 1,
			prefix: ['Must be unique in combination with:'],
			content:
				uniqueKeys
					?.filter((key) => key !== currentSchemaField.name)
					?.map((key) => ({ content: key, isFieldBlock: true })) ?? [],
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem ?
			{
				prefix:
					Array.isArray(computedRestrictionItem.prefix) ?
						[...computedRestrictionItem.prefix]
					:	[computedRestrictionItem.prefix],
				content:
					Array.isArray(computedRestrictionItem.content) ?
						[...computedRestrictionItem.content]
					:	[computedRestrictionItem.content],
			}
		:	{
				prefix: [],
				content: [],
			};
};

export const computeAllowedValuesColumn = (
	fieldLevelRestrictions: SchemaRestrictions,
	schemaLevelRestrictions: Schema['restrictions'],
	currentSchemaField: SchemaField,
): AllowedValuesBaseDisplayItem => {
	const allowedValuesBaseDisplayItem: AllowedValuesBaseDisplayItem = {};
	if (!fieldLevelRestrictions || Object.keys(fieldLevelRestrictions)?.length === 0) {
		return {};
	}

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
	if (schemaLevelRestrictions?.foreignKey !== undefined || schemaLevelRestrictions?.uniqueKey !== undefined) {
		allowedValuesBaseDisplayItem.entityRelationships = handleKeys(schemaLevelRestrictions, currentSchemaField);
	}
	if (currentSchemaField.unique) {
		allowedValuesBaseDisplayItem.unique = { prefix: [], content: [{ content: 'Must be unique' }] };
	}
	return allowedValuesBaseDisplayItem;
};

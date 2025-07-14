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
	ForeignKeyRestriction,
	RestrictionCondition,
	RestrictionRange,
	SchemaField,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

export type ContentType = {
	isCode?: boolean;
	content: string;
};
export type RestrictionItem = {
	prefix: string[];
	content: ContentType[];
};

export type RestrictionField = RestrictionItem | undefined;

export type AllowedValuesBaseDisplayItem = {
	dependsOn?: RestrictionItem;
	regularExpression?: RestrictionItem;
	codeList?: RestrictionItem;
	range?: RestrictionItem;
	codeListWithCountRestrictions?: RestrictionItem;
	unique?: RestrictionItem;
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
	const allFields: ContentType[] = Array.from(
		new Set(conditions.flatMap((condition: RestrictionCondition) => condition.fields)),
	).map((field) => ({ content: field }));

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
	// normalize to array, then wrap each pattern in a ContentType
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

const handleKeys = (restrictions: SchemaRestrictions, currentSchemaField: SchemaField): RestrictionItem | undefined => {
	const isUnique = currentSchemaField.unique === true;

	const uniqueKeys =
		restrictions && 'uniqueKey' in restrictions && Array.isArray(restrictions.uniqueKey) ?
			restrictions.uniqueKey
		:	undefined;

	const foreignKey =
		restrictions && 'foreignKey' in restrictions && restrictions.foreignKey ?
			(restrictions.foreignKey as ForeignKeyRestriction)
		:	undefined;

	const computeRestrictions = [
		{
			condition: foreignKey !== undefined && foreignKey.mappings.length === 1,
			prefix: ['Must reference an existing:'],
			content: [
				{ content: `${foreignKey?.schema[0]}`, isCode: true },
				{
					content: `as defined in the ${foreignKey?.schema} schema. Multiple sequencing records can reference the same ${foreignKey?.schema}`,
				},
			],
		},
		{
			condition: uniqueKeys !== undefined && uniqueKeys.length > 1,
			prefix: ['Must be unique in combination with:'],
			content:
				uniqueKeys?.filter((key) => key !== currentSchemaField.name).map((key) => ({ content: key, isCode: true })) ??
				[],
		},
		{
			condition:
				isUnique && Array.isArray(uniqueKeys) && uniqueKeys.length === 1 && uniqueKeys[0] === currentSchemaField.name,
			prefix: ['A unique value that matches the following restrictions:'],
			content: [],
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
	restrictions: SchemaRestrictions,
	currentSchemaField: SchemaField,
	schemaFields: SchemaField[],
): AllowedValuesBaseDisplayItem => {
	const allowedValuesBaseDisplayItem: AllowedValuesBaseDisplayItem = {};

	if (!restrictions || Object.keys(restrictions).length === 0) {
		return {};
	}

	if ('if' in restrictions && restrictions.if !== undefined && restrictions.if.conditions !== undefined) {
		allowedValuesBaseDisplayItem.dependsOn = handleDependsOn(restrictions.if.conditions);
	}

	if ('regex' in restrictions && restrictions.regex !== undefined) {
		allowedValuesBaseDisplayItem.regularExpression = handleRegularExpression(restrictions.regex);
	}

	if ('codeList' in restrictions && restrictions.codeList !== undefined && !('count' in restrictions)) {
		allowedValuesBaseDisplayItem.codeList = handleCodeList(restrictions.codeList);
	}

	if ('range' in restrictions && restrictions.range !== undefined) {
		allowedValuesBaseDisplayItem.range = handleRange(restrictions.range);
	}

	if (
		'codeList' in restrictions &&
		restrictions.codeList !== undefined &&
		'count' in restrictions &&
		restrictions.count != undefined &&
		currentSchemaField.isArray !== undefined
	) {
		allowedValuesBaseDisplayItem.codeListWithCountRestrictions = handleCodeListsWithCountRestrictions(
			restrictions.codeList,
			restrictions.count,
			currentSchemaField,
		);
	}

	if (currentSchemaField.unique) {
		allowedValuesBaseDisplayItem.unique = { prefix: [], content: [{ content: 'Must be unique' }] };
	}

	return allowedValuesBaseDisplayItem;
};

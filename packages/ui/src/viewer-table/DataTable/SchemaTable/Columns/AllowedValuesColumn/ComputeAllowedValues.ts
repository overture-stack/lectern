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
	SchemaField,
	SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

export type RestrictionItem = {
	prefix: string | string[] | null;
	content: string | string[] | null;
};
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

const handleRange = (range: RestrictionRange): RestrictionItem | null => {
	const computeRestrictions = [
		{
			condition: range.min !== undefined && range.max !== undefined,
			prefix: ['Min', 'Max'],
			content: [`${range.min}`, `${range.max}`],
		},
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
			prefix: 'Greater than',
			content: `${range.exclusiveMin}`,
		},
		{
			condition: range.exclusiveMax !== undefined,
			prefix: 'Less than',
			content: `${range.exclusiveMax}`,
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);

	return computedRestrictionItem ?
			{
				prefix: computedRestrictionItem.prefix,
				content: computedRestrictionItem.content,
			}
		:	null;
};
const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: RestrictionRange,
	schemaField: SchemaField,
): RestrictionItem | null => {
	const { isArray, delimiter } = schemaField;
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
				prefix: computedRestrictionItem.prefix,
				content: Array.isArray(codeList) ? codeList.map((item: string | number) => `${item}`) : [codeList],
			}
		:	null;
};

const handleDependsOn = (conditions: RestrictionCondition[]): RestrictionItem | null => {
	const allFields: string[] = conditions.flatMap((condition: RestrictionCondition) => {
		return condition.fields;
	});

	return allFields.length > 0 ?
			{
				prefix: 'Depends on:',
				content: [...new Set(allFields)],
			}
		:	null;
};

const handleRegularExpression = (regularExpression: string | string[]) => {
	return {
		prefix: Array.isArray(regularExpression) ? 'Must match patterns:' : 'Must match pattern:',
		content: regularExpression,
	};
};

const handleCodeList = (codeList: string | string[] | number[]): RestrictionItem | null => {
	return {
		prefix: 'One of:',
		content: Array.isArray(codeList) ? codeList.map((item: string | number) => `${item}`) : [codeList],
	};
};

export const computeAllowedValuesColumn = (
	restrictions: SchemaRestrictions,
	schemaField: SchemaField,
): AllowedValuesBaseDisplayItem => {
	var allowedValuesBaseDisplayItem = {};

	if (!restrictions || Object.keys(restrictions).length === 0) {
		return allowedValuesBaseDisplayItem;
	}

	if ('if' in restrictions && restrictions.if !== undefined && restrictions.if.conditions !== undefined) {
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			dependsOn: handleDependsOn(restrictions.if.conditions),
		};
	}

	if ('regex' in restrictions && restrictions.regex !== undefined) {
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			regularExpression: handleRegularExpression(restrictions.regex),
		};
	}

	if ('codeList' in restrictions && restrictions.codeList !== undefined && !('count' in restrictions)) {
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			codeList: handleCodeList(restrictions.codeList),
		};
	}

	if ('range' in restrictions && restrictions.range !== undefined) {
		allowedValuesBaseDisplayItem = { ...allowedValuesBaseDisplayItem, range: handleRange(restrictions.range) };
	}

	if (
		'codeList' in restrictions &&
		restrictions.codeList !== undefined &&
		'count' in restrictions &&
		restrictions.count != undefined &&
		schemaField.isArray !== undefined
	) {
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			codeListWithCountRestrictions: handleCodeListsWithCountRestrictions(
				restrictions.codeList,
				restrictions.count,
				schemaField,
			),
		};
	}

	if (schemaField.unique) {
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			unique: { prefix: null, content: 'Must be unique' },
		};
	}

	return allowedValuesBaseDisplayItem;
};

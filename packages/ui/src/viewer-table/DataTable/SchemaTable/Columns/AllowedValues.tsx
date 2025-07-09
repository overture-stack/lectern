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
import { MatchRuleCount, RestrictionRange, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

import Pill from '../../../../common/Pill';
import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';

export type AllowedValuesBaseDisplayItem = any;

export type RestrictionItem = {
	prefix: string | string[] | null;
	content: string | string[] | null;
};

export type AllowedValuesColumnProps = {
	restrictions: CellContext<SchemaField, SchemaRestrictions>;
};

const linkStyle = (theme: Theme) => css`
	${theme.typography?.label};
	color: ${theme.colors.black};
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	background: none;
	border: none;
	padding: 0;
	margin-top: 4px;
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

const pillStyle = (theme: Theme) => ({
	fontFamily: 'B612 Mono',
	color: theme.colors.accent_dark,
	fontWeight: '400',
	lineHeight: '20px',
	fontSize: '13px',
});

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

const handleCount = (
	count: RestrictionRange,
	codeListDisplay: string,
	delimiterText: string,
): RestrictionItem | null => {
	const computeRestrictions = [
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
				content: codeListDisplay,
			}
		:	null;
};

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: MatchRuleCount,
	restrictionItems: RestrictionItem[],
	isArray: boolean,
	delimiter: string = ',',
): void => {
	const codeListDisplay = Array.isArray(codeList) ? codeList.join(',\n') : codeList;
	const delimiterText = isArray ? `, delimited by "${delimiter}"` : '';

	if (typeof count === 'number') {
		restrictionItems.push({
			prefix: `Exactly ${count}${delimiterText} from:\n`,
			content: `${codeListDisplay}`,
		});
	} else {
		handleCount(count, codeListDisplay, delimiterText);
	}
};

const handleDependsOn = (schemaRestrictions: SchemaRestrictions): RestrictionItem[] => {
	const restrictionItems: RestrictionItem[] = [];

	if (schemaRestrictions === undefined) {
		return restrictionItems;
	}

	if (
		'if' in schemaRestrictions &&
		'conditions' in schemaRestrictions.if &&
		Array.isArray(schemaRestrictions.if.conditions)
	) {
		const allFields: string[] = [];
		schemaRestrictions.if.conditions.forEach((condition) => {
			if (condition.fields !== undefined) {
				if (Array.isArray(condition.fields)) {
					allFields.push(...condition.fields);
				} else if (typeof condition.fields === 'string') {
					allFields.push(condition.fields);
				}
			}
		});

		// Since there can be multiple fields with multiple conditions, there is a possibility that there are duplicates
		const uniqueFields = [...new Set(allFields)];
		if (uniqueFields.length > 0) {
			restrictionItems.push({
				prefix: 'Depends on:\n',
				content: uniqueFields.join(', '),
			});
		}
	}

	return restrictionItems;
};

const handleRegularExpression = (regularExpression: string | string[]) => {
	return {
		prefix: Array.isArray(regularExpression) ? 'Must match patterns:' : 'Must match pattern:',
		content: regularExpression,
	};
};

export const computeAllowedValuesColumn = (
	restrictions: SchemaRestrictions,
	schemaField: SchemaField,
): AllowedValuesBaseDisplayItem => {
	var allowedValuesBaseDisplayItem = {};

	if (!restrictions || Object.keys(restrictions).length === 0) {
		const empty = {
			prefix: null,
			content: null,
		};
		return empty;
	}
	// restrictionItems.push(...handleDependsOn(restrictions));

	if ('regex' in restrictions && restrictions.regex !== undefined) {
		const computedRegularExpressionRestrictionItem = handleRegularExpression(restrictions.regex);
		allowedValuesBaseDisplayItem = {
			...allowedValuesBaseDisplayItem,
			regularExpression: computedRegularExpressionRestrictionItem,
		};
	}

	if ('codeList' in restrictions && restrictions.codeList !== undefined && !('count' in restrictions)) {
		const codeListDisplay =
			Array.isArray(restrictions.codeList) ? restrictions.codeList.join(',\n') : `"${restrictions.codeList}"`;
		restrictionItems.push({ prefix: 'One of: \n', content: `${codeListDisplay}` });
	}

	if ('range' in restrictions && restrictions.range !== undefined) {
		const computedRangeRestrictionItem = handleRange(restrictions.range);
		allowedValuesBaseDisplayItem = { ...allowedValuesBaseDisplayItem, range: computedRangeRestrictionItem };
	}

	if (
		'codeList' in restrictions &&
		restrictions.codeList !== undefined &&
		'count' in restrictions &&
		restrictions.count != undefined &&
		schemaField.isArray !== undefined
	) {
		handleCodeListsWithCountRestrictions(
			restrictions.codeList,
			restrictions.count,
			restrictionItems,
			schemaField.isArray,
			schemaField.delimiter ?? ',',
		);
	}

	if (schemaField.unique) {
		restrictionItems.push({ prefix: null, content: 'Must be unique' });
	}

	return;
};

export const renderAllowedValuesColumn = (restrictions: SchemaRestrictions, schemaField: SchemaField) => {
	const restrictionItems = computeAllowedValuesColumn(restrictions, schemaField);

	const theme = useThemeContext();

	if (restrictions === undefined) {
		return;
	}

	const renderRestrictionItem = (item: RestrictionItem, index: number) => {
		const { prefix, content } = item;
		if (prefix === 'Depends on:\n') {
			return (
				<div key={index}>
					{prefix && <strong>{prefix}</strong>}
					<Pill size="extra-small" style={pillStyle(theme)}>
						{content}
					</Pill>
				</div>
			);
		}

		return (
			<div key={index}>
				{prefix && <strong>{prefix}</strong>}
				{content}
			</div>
		);
	};

	return (
		<div>
			{restrictionItems.map(renderRestrictionItem)}
			{'if' in restrictions && (
				<div onClick={() => alert('Mock Modal')} css={linkStyle(theme)}>
					View details
				</div>
			)}
		</div>
	);
};

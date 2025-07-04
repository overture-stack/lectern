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

export type restrictionItem = {
	prefix: string | null;
	content: string;
};
export type AllowedValuesColumnProps = {
	restrictions: CellContext<SchemaField, SchemaRestrictions>;
};

const handleRange = (range: RestrictionRange, restrictionItems: restrictionItem[]): void => {
	if (range.min !== undefined && range.max !== undefined) {
		restrictionItems.push({ prefix: 'Min: ', content: `${range.min}` });
		restrictionItems.push({ prefix: 'Max: ', content: `${range.max}` });
	} else if (range.min !== undefined) {
		restrictionItems.push({ prefix: 'Min: ', content: `${range.min}` });
	} else if (range.max !== undefined) {
		restrictionItems.push({ prefix: 'Max: ', content: `${range.max}` });
	} else if (range.exclusiveMin !== undefined) {
		restrictionItems.push({ prefix: 'Greater than ', content: `${range.exclusiveMin}` });
	} else if (range.exclusiveMax !== undefined) {
		restrictionItems.push({ prefix: 'Less than ', content: `${range.exclusiveMax}` });
	}
};

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: MatchRuleCount,
	restrictionItems: restrictionItem[],
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
		if (count.min !== undefined && count.max !== undefined) {
			restrictionItems.push({
				prefix: `Select ${count.min} to ${count.max}${delimiterText} from:\n`,
				content: `${codeListDisplay}`,
			});
		} else if (count.min !== undefined) {
			restrictionItems.push({
				prefix: `At least ${count.min}${delimiterText} from:\n`,
				content: `${codeListDisplay}`,
			});
		} else if (count.max !== undefined) {
			restrictionItems.push({
				prefix: `Up to ${count.max}${delimiterText} from:\n`,
				content: `${codeListDisplay}`,
			});
		} else if (count.exclusiveMin !== undefined) {
			restrictionItems.push({
				prefix: `More than ${count.exclusiveMin}${delimiterText} from:\n`,
				content: `${codeListDisplay}`,
			});
		} else if (count.exclusiveMax !== undefined) {
			restrictionItems.push({
				prefix: `Fewer than ${count.exclusiveMax}${delimiterText} from:\n`,
				content: `${codeListDisplay}`,
			});
		}
	}
};

export const computeAllowedValuesColumn = (
	restrictions: CellContext<SchemaField, SchemaRestrictions>,
): restrictionItem[] => {
	const schemaField: SchemaField = restrictions.row.original;
	const restrictionsValue: SchemaRestrictions = restrictions.getValue();
	const restrictionItems: restrictionItem[] = [];

	if (!restrictionsValue || Object.keys(restrictionsValue).length === 0) {
		restrictionItems.push({ prefix: null, content: 'None' });
		return restrictionItems;
	}
	restrictionItems.push(...handleDependsOn(restrictionsValue));

	if ('regex' in restrictionsValue && restrictionsValue.regex) {
		const regexValue =
			Array.isArray(restrictionsValue.regex) ? restrictionsValue.regex.join(', ') : restrictionsValue.regex;
		restrictionItems.push({
			prefix: 'Must match pattern: ',
			content: `${regexValue}\nSee field description for examples.`,
		});
	}

	if ('codeList' in restrictionsValue && restrictionsValue.codeList && !('count' in restrictionsValue)) {
		const codeListDisplay =
			Array.isArray(restrictionsValue.codeList) ?
				restrictionsValue.codeList.join(',\n')
			:	`"${restrictionsValue.codeList}"`;
		restrictionItems.push({ prefix: 'One of: \n', content: `${codeListDisplay}` });
	}

	if ('range' in restrictionsValue && restrictionsValue.range) {
		handleRange(restrictionsValue.range, restrictionItems);
	}

	if (
		'codeList' in restrictionsValue &&
		restrictionsValue.codeList &&
		'count' in restrictionsValue &&
		restrictionsValue.count
	) {
		handleCodeListsWithCountRestrictions(
			restrictionsValue.codeList,
			restrictionsValue.count,
			restrictionItems,
			schemaField.isArray || false,
			schemaField.delimiter ?? ',',
		);
	}

	if (schemaField.unique) {
		restrictionItems.push({ prefix: null, content: 'Must be unique' });
	}

	if (restrictionItems.length === 0) {
		restrictionItems.push({ prefix: null, content: 'None' });
	}

	return restrictionItems;
};

const handleDependsOn = (schemaRestrictions: SchemaRestrictions): restrictionItem[] => {
	const restrictionItems: restrictionItem[] = [];

	if (schemaRestrictions && 'compare' in schemaRestrictions && schemaRestrictions.compare) {
	}
	if (
		schemaRestrictions &&
		'if' in schemaRestrictions &&
		schemaRestrictions.if &&
		'conditions' in schemaRestrictions.if &&
		schemaRestrictions.if.conditions &&
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
export const renderAllowedValuesColumn = (restrictions: CellContext<SchemaField, SchemaRestrictions>) => {
	const restrictionItems = computeAllowedValuesColumn(restrictions);
	const restrictionsValue: SchemaRestrictions = restrictions.getValue();

	const theme = useThemeContext();

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

	const pillStyle = {
		fontFamily: 'B612 Mono',
		color: theme.colors.accent_dark,
		fontWeight: '400',
		lineHeight: '20px',
		fontSize: '13px',
	};
	//TODO: implement the modal
	const handleViewDetails = () => {
		alert('Modal has been opened\n\n\n Hello World');
	};

	const renderRestrictionItem = (item: restrictionItem) => {
		const { prefix, content } = item;
		if (prefix === 'Depends on:\n') {
			return (
				<div key={`${prefix}-${content}`}>
					{prefix && <strong>{prefix}</strong>}
					<Pill size="extra-small" style={pillStyle}>
						{content}
					</Pill>
				</div>
			);
		}

		return (
			<div key={`${prefix}-${content}`}>
				{prefix && <strong>{prefix}</strong>}
				{content}
			</div>
		);
	};

	const hasConditionalRestrictions = restrictionsValue && 'if' in restrictionsValue && restrictionsValue.if;

	return (
		<div>
			{restrictionItems.map(renderRestrictionItem)}
			{hasConditionalRestrictions && (
				<div onClick={handleViewDetails} css={linkStyle(theme)}>
					View details
				</div>
			)}
		</div>
	);
};

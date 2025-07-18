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

import { RestrictionCondition } from '@overture-stack/lectern-dictionary';
import React from 'react';

import FieldBlock from '../../common/FieldBlock';

export type MatchCase = RestrictionCondition['case'];

const getCaseText = (matchCase: MatchCase): string => {
	switch (matchCase) {
		case 'none':
			return 'NOT EQUAL';
		case 'all':
			return 'EQUAL';
		default:
			return 'EQUALS';
	}
};

const getConjunctionText = (matchCase: MatchCase): string => {
	return matchCase === 'all' || matchCase === 'none' ? 'AND' : 'OR';
};

const renderFields = (fields: string[], matchCase: MatchCase) => {
	return (
		<>
			{fields.map((field, index) => (
				<>
					<FieldBlock key={field}>{field}</FieldBlock>
					{index < fields.length - 1 && ` ${getConjunctionText(matchCase)} `}
				</>
			))}
		</>
	);
};

const valueMatch = (restrictionCondition: RestrictionCondition) => {
	const valueMatch = restrictionCondition.match.value;
	const caseText = getCaseText(restrictionCondition.case);
	return (
		<>
			{' '}
			{caseText} "{valueMatch}"
		</>
	);
};

const codeListMatch = (restrictionCondition: RestrictionCondition) => {
	const valueMatch = restrictionCondition.match.codeList;
	const codeList = valueMatch?.join(', ');
	return <> is one of: {codeList}</>;
};

const regularExpressionMatch = (restrictionCondition: RestrictionCondition) => {
	const valueMatch = restrictionCondition.match.regex;
	const regularExpression = Array.isArray(valueMatch) ? valueMatch.join(', ') : valueMatch;
	return (
		<>
			{' '}
			{Array.isArray(valueMatch) ? 'matches patterns:' : 'matches pattern:'} {regularExpression}
		</>
	);
};

const rangeMatch = (restrictionCondition: RestrictionCondition) => {
	const range = restrictionCondition.match.range;

	if (range === undefined) {
		return;
	}

	if (range.min !== undefined && range.max !== undefined) {
		return (
			<>
				{' '}
				is between {range.min} and {range.max}
			</>
		);
	}

	const computeRestrictions = [
		{
			condition: range.min !== undefined,
			prefix: 'is at least',
			content: `${range.min}`,
		},
		{
			condition: range.max !== undefined,
			prefix: 'is at most',
			content: `${range.max}`,
		},
		{
			condition: range.exclusiveMin !== undefined,
			prefix: 'is greater than',
			content: `${range.exclusiveMin}`,
		},
		{
			condition: range.exclusiveMax !== undefined,
			prefix: 'is less than',
			content: `${range.exclusiveMax}`,
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);
	return computedRestrictionItem ?
			<>
				{' '}
				{computedRestrictionItem.prefix} {computedRestrictionItem.content}
			</>
		:	undefined;
};

const existsMatch = (restrictionCondition: RestrictionCondition) => {
	const exists = restrictionCondition.match.exists;
	return <> {exists ? 'has a value' : 'is empty'}</>;
};

const countMatch = (restrictionCondition: RestrictionCondition) => {
	const count = restrictionCondition.match.count;

	if (count === undefined) {
		return;
	}

	if (typeof count === 'number') {
		return (
			<>
				{' '}
				has exactly {count} item{count === 1 ? '' : 's'}
			</>
		);
	}

	if (count.min !== undefined && count.max !== undefined) {
		return (
			<>
				{' '}
				has between {count.min} and {count.max} items
			</>
		);
	}

	const computeRestrictions = [
		{
			condition: count.min !== undefined,
			prefix: 'has',
			content: `${count.min} or more items`,
		},
		{
			condition: count.max !== undefined,
			prefix: 'has',
			content: `${count.max} or fewer items`,
		},
		{
			condition: count.exclusiveMin !== undefined,
			prefix: 'has',
			content: `more than ${count.exclusiveMin} items`,
		},
		{
			condition: count.exclusiveMax !== undefined,
			prefix: 'has',
			content: `fewer than ${count.exclusiveMax} items`,
		},
	];

	const computedRestrictionItem = computeRestrictions.find((item) => item.condition);

	return computedRestrictionItem ?
			<>
				{' '}
				{computedRestrictionItem.prefix} {computedRestrictionItem.content}
			</>
		:	undefined;
};

export const renderConditions = (conditions: RestrictionCondition[], matchCase: MatchCase) => {
	const conjunctionText = getConjunctionText(matchCase);

	return (
		<>
			{conditions.map((condition, index) => {
				const { fields, match } = condition;
				return (
					<>
						{renderFields(fields, condition.case)}
						{match.value !== undefined && valueMatch(condition)}
						{match.codeList !== undefined && codeListMatch(condition)}
						{match.regex !== undefined && regularExpressionMatch(condition)}
						{match.range !== undefined && rangeMatch(condition)}
						{match.exists !== undefined && existsMatch(condition)}
						{match.count !== undefined && countMatch(condition)}
						{index < conditions.length - 1 && <> {conjunctionText} </>}
					</>
				);
			})}
		</>
	);
};

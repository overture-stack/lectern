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
	ArrayTestCase,
	MatchRuleCodeList,
	MatchRuleCount,
	MatchRuleExists,
	MatchRuleRange,
	MatchRuleRegex,
	MatchRuleValue,
	RestrictionCondition,
} from '@overture-stack/lectern-dictionary';
import React, { Fragment } from 'react';
import FieldBlock from '../../common/FieldBlock';

const getCaseText = (matchCase: ArrayTestCase, fieldCount: number): string => {
	const isPlural = fieldCount > 1 && matchCase !== 'any';

	switch (matchCase) {
		case 'all':
			return isPlural ? 'EQUAL' : 'EQUALS';
		case 'any':
			return 'EQUALS';
		case 'none':
			return isPlural ? 'DO NOT EQUAL' : 'DOES NOT EQUAL';
	}
};

const getConjunctionText = (matchCase: ArrayTestCase): string => {
	switch (matchCase) {
		case 'all':
			return 'AND';
		case 'none':
			return 'AND';
		case 'any':
			return 'OR';
	}
};

const renderFields = (fields: string[], matchCase: ArrayTestCase) => {
	return (
		<Fragment>
			{fields.map((field, index) => (
				<Fragment key={field}>
					<FieldBlock>{field}</FieldBlock>
					{index < fields.length - 1 && ` ${getConjunctionText(matchCase)} `}
				</Fragment>
			))}
		</Fragment>
	);
};

const valueMatch = (valueMatch: MatchRuleValue, matchCase: ArrayTestCase, fieldCount: number) => {
	return (
		<Fragment>
			{getCaseText(matchCase, fieldCount)} "{valueMatch}"
		</Fragment>
	);
};

const codeListMatch = (codeListMatch: MatchRuleCodeList) => {
	const codeList = codeListMatch?.join(', ');
	return <Fragment>is one of: {codeList}</Fragment>;
};

const regularExpressionMatch = (regexMatch: MatchRuleRegex) => {
	const regularExpression = Array.isArray(regexMatch) ? regexMatch.join(', ') : regexMatch;
	return (
		<Fragment>
			{Array.isArray(regexMatch) ? 'matches patterns:' : 'matches pattern:'} {regularExpression}
		</Fragment>
	);
};

const rangeMatch = (rangeMatch: MatchRuleRange) => {
	const computeRestrictions = [
		{
			condition: rangeMatch.min !== undefined,
			prefix: 'is at least',
			content: `${rangeMatch.min}`,
		},
		{
			condition: rangeMatch.exclusiveMin !== undefined,
			prefix: 'is greater than',
			content: `${rangeMatch.exclusiveMin}`,
		},
		{
			condition: rangeMatch.max !== undefined,
			prefix: 'is at most',
			content: `${rangeMatch.max}`,
		},
		{
			condition: rangeMatch.exclusiveMax !== undefined,
			prefix: 'is less than',
			content: `${rangeMatch.exclusiveMax}`,
		},
	];

	const computedRestrictionItems = computeRestrictions.filter((item) => item.condition);
	return computedRestrictionItems ?
			<Fragment>
				{computedRestrictionItems
					.map((computedRestrictionItem) => `${computedRestrictionItem.prefix} ${computedRestrictionItem.content}`)
					.join(' and ')}
			</Fragment>
		:	undefined;
};

const existsMatch = (existsMatch: MatchRuleExists) => {
	return <Fragment>{existsMatch ? 'has a value' : 'is empty'}</Fragment>;
};

const countMatch = (countMatch: MatchRuleCount) => {
	if (typeof countMatch === 'number') {
		return (
			<Fragment>
				has exactly {countMatch} item{countMatch === 1 ? '' : 's'}
			</Fragment>
		);
	}

	const computeRestrictions = [
		{
			condition: countMatch.min !== undefined,
			prefix: 'has',
			content: `${countMatch.min} or more items`,
		},
		{
			condition: countMatch.exclusiveMin !== undefined,
			prefix: 'has',
			content: `more than ${countMatch.exclusiveMin} items`,
		},
		{
			condition: countMatch.max !== undefined,
			prefix: 'has',
			content: `${countMatch.max} or fewer items`,
		},
		{
			condition: countMatch.exclusiveMax !== undefined,
			prefix: 'has',
			content: `fewer than ${countMatch.exclusiveMax} items`,
		},
	];

	const computedRestrictionItems = computeRestrictions.filter((item) => item.condition);

	return computedRestrictionItems.length > 0 ?
			<Fragment>{computedRestrictionItems.map((item) => `${item.prefix} ${item.content}`).join(' and ')}</Fragment>
		:	undefined;
};

/**
 * Renders conditional restriction details as formatted text based on the provided conditions and match case.
 * @param conditions Array of restriction conditions to be rendered.
 * @param matchCase Specifies how the conditions are joined (all, any, none).
 * @returns JSX elements containing the formatted conditional restriction details.
 */

export const ConditionalRestrictionDetails = (conditions: RestrictionCondition[], matchCase: ArrayTestCase) => {
	const conjunctionText = getConjunctionText(matchCase);

	return (
		<Fragment>
			{conditions.map((condition, index) => {
				const { fields, match } = condition;
				return (
					<Fragment key={index}>
						{condition.case && renderFields(fields, condition.case)}
						{match.value !== undefined && condition.case !== undefined && (
							<Fragment> {valueMatch(match.value, condition.case, fields.length)}</Fragment>
						)}
						{match.codeList !== undefined && <Fragment> {codeListMatch(match.codeList)}</Fragment>}
						{match.regex !== undefined && <Fragment> {regularExpressionMatch(match.regex)}</Fragment>}
						{match.range !== undefined && <Fragment> {rangeMatch(match.range)}</Fragment>}
						{match.exists !== undefined && <Fragment> {existsMatch(match.exists)}</Fragment>}
						{match.count !== undefined && <Fragment> {countMatch(match.count)}</Fragment>}
						{index < conditions.length - 1 && <Fragment> {conjunctionText} </Fragment>}
					</Fragment>
				);
			})}
		</Fragment>
	);
};

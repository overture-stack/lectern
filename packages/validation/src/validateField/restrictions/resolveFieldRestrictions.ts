/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
	TypeUtils,
	type AnyFieldRestrictions,
	type DataRecord,
	type DataRecordValue,
	type SchemaField,
	type SchemaFieldRestrictions,
} from '@overture-stack/lectern-dictionary';
import type { FieldRestrictionRule } from '../FieldRestrictionRule';
import { testConditionalRestriction } from '../conditions/testConditionalRestriction';

const extractRulesFromRestriction = (restrictions: AnyFieldRestrictions): FieldRestrictionRule[] => {
	const rules: FieldRestrictionRule[] = [];

	if ('codeList' in restrictions) {
		if (Array.isArray(restrictions.codeList)) {
			rules.push({ type: 'codeList', rule: restrictions.codeList });
		}
	}
	if ('empty' in restrictions) {
		if (restrictions.empty) {
			rules.push({ type: 'empty', rule: restrictions.empty });
		}
	}
	if ('range' in restrictions) {
		if (restrictions.range) {
			rules.push({ type: 'range', rule: restrictions.range });
		}
	}
	if ('regex' in restrictions) {
		if (restrictions.regex) {
			rules.push({ type: 'regex', rule: restrictions.regex });
		}
	}
	if ('required' in restrictions) {
		if (restrictions.required) {
			rules.push({ type: 'required', rule: restrictions.required });
		}
	}

	return rules;
};

const recursiveResolveRestrictions = (
	restrictions: SchemaFieldRestrictions,
	value: DataRecordValue,
	record: DataRecord,
): FieldRestrictionRule[] => {
	if (!restrictions) {
		return [];
	}

	const output = TypeUtils.asArray(restrictions).flatMap<FieldRestrictionRule>((restrictionObject) => {
		if ('if' in restrictionObject) {
			// This object is a conditional restriction, we will test the record vs the conditions then extract rules
			//  from either the `then` or `else` block.
			const result = testConditionalRestriction(restrictionObject.if, value, record);
			if (result) {
				return recursiveResolveRestrictions(restrictionObject.then, value, record);
			} else {
				return recursiveResolveRestrictions(restrictionObject.else, value, record);
			}
		} else {
			// The restriction object here is not conditional, so we can grab the rules and add them to the output
			return extractRulesFromRestriction(restrictionObject);
		}
	});

	return output;
};

/**
 * Convert the restrictions found in a SchemaField definition into a list of rules that apply for this specific value
 * and DataRecord. This will check all conditional restrictions versus the field value and its data record, exracting
 * the restriction rules that apply based on the conditional logic.
 */
export const resolveFieldRestrictions = (
	value: DataRecordValue,
	record: DataRecord,
	field: SchemaField,
): FieldRestrictionRule[] => recursiveResolveRestrictions(field.restrictions, value, record);

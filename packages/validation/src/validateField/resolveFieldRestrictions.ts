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
	type DataRecord,
	type DataRecordValue,
	type Defined,
	type SchemaField,
	type SchemaRestrictions,
} from '@overture-stack/lectern-dictionary';
import type { FieldRestrictionRule } from './FieldRestrictionRule';

const extractRulesFromRestrictionObject = (restrictions: Defined<SchemaRestrictions>): FieldRestrictionRule[] => {
	const output: FieldRestrictionRule[] = [];
	if ('required' in restrictions) {
		if (restrictions.required) {
			output.push({ type: 'required', rule: restrictions.required });
		}
	}
	if ('codeList' in restrictions) {
		if (Array.isArray(restrictions.codeList)) {
			output.push({ type: 'codeList', rule: restrictions.codeList });
		}
	}
	if ('range' in restrictions) {
		if (restrictions.range) {
			output.push({ type: 'range', rule: restrictions.range });
		}
	}
	if ('regex' in restrictions) {
		if (restrictions.regex) {
			output.push({ type: 'regex', rule: restrictions.regex });
		}
	}
	return output;
};

/**
 * Convert the restrictions found in a SchemaField definition into a list of rules that apply for this specific value
 * and DataRecord.
 */
export const resolveFieldRestrictions = (
	_value: DataRecordValue,
	_record: DataRecord,
	field: SchemaField,
): FieldRestrictionRule[] => {
	// TODO: This function requires value and record parameters so that conditional restrictions can be resolved.
	// The original implementation with a static set of available restrictions does not need these parameters.
	if (!field.restrictions) {
		return [];
	}

	return TypeUtils.asArray(field.restrictions).flatMap(extractRulesFromRestrictionObject);
};

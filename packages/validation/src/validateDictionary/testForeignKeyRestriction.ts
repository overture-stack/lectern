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

import type { DataRecord, ForeignKeyRestriction } from 'dictionary';
import type { SchemaDataReference } from './collectSchemaReferenceData';
import type { DictionaryValidationErrorRecordForeignKey } from './DictionaryValidationError';
import { invalid, valid, type TestResult } from '../types';
import { isDefined } from 'common';

/**
 * Test foreignKey restrictions on a single DataRecord, checked against a pre-calculated `foreignSchemaRefereceData` with the values
 * of relevant fields from foreign schemas. The `foreignSchemaRefereceData` can be created using `collectSchemaReferenceData`.
 *
 * Since foreignKey restrictions contain nested arrays, this test is a double loop over:
 * 1. Foreign Schema name
 * 2. Field name in foreign schema
 *
 * This is because each foreign key rule is an array of arrays, representing multiple foreign schemas with multiple foreign fields that
 * must be matched to a local field.
 */
export const testForeignKeyRestriction = (
	record: DataRecord,
	foreignKeyRestrictions: ForeignKeyRestriction[],
	foreignSchemaReferenceData: Map<string, SchemaDataReference>,
): TestResult<DictionaryValidationErrorRecordForeignKey[]> => {
	if (foreignKeyRestrictions.length === 0) {
		return valid();
	}

	// Loop over all foreign key rules -
	// These are nested since we could have multiple foreign schema mappings and for each foreign schema we could have multiple fields.
	// The result would be an array of arrays (array of schema results which are each an array of field mapping results) so we flatten the result.
	const recordErrors = foreignKeyRestrictions.flatMap<DictionaryValidationErrorRecordForeignKey>((restriction) => {
		const foreignKeyErrors: DictionaryValidationErrorRecordForeignKey[] = restriction.mappings
			.map<DictionaryValidationErrorRecordForeignKey | undefined>((foreignKeyMapping) => {
				// This is the actual test, taking the local value and looking up if that value exists in
				const localValue = record[foreignKeyMapping.local];
				if (localValue === undefined) {
					// Only apply foreignKey test to records that have a value in the local field
					return undefined;
				}

				const hasForeignReference = foreignSchemaReferenceData
					.get(restriction.schema)
					?.get(foreignKeyMapping.foreign)
					?.has(localValue);

				return hasForeignReference
					? undefined
					: {
							reason: 'INVALID_BY_FOREIGNKEY',
							fieldName: foreignKeyMapping.local,
							foreignSchema: { fieldName: foreignKeyMapping.foreign, schemaName: restriction.schema },
							fieldValue: localValue,
						};
			})
			.filter(isDefined);
		return foreignKeyErrors;
	});

	if (recordErrors.length) {
		return invalid(recordErrors);
	}

	return valid();
};

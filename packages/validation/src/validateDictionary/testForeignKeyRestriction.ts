import type { DataRecord, ForeignKeyRestriction } from 'dictionary';
import type { SchemaDataReference } from './collectSchemaReferenceData';
import type { DictionaryValidationRecordErrorForeignKey } from './DictionaryValidationError';
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
): TestResult<DictionaryValidationRecordErrorForeignKey[]> => {
	if (foreignKeyRestrictions.length === 0) {
		return valid();
	}

	// Loop over all foreign key rules -
	// These are nested since we could have multiple foreign schema mappings and for each foreign schema we could have multiple fields.
	// The result would be an array of arrays (array of schema results which are each an array of field mapping results) so we flatten the result.
	const recordErrors = foreignKeyRestrictions.flatMap<DictionaryValidationRecordErrorForeignKey>((restriction) => {
		const foreignKeyErrors: DictionaryValidationRecordErrorForeignKey[] = restriction.mappings
			.map<DictionaryValidationRecordErrorForeignKey | undefined>((foreignKeyMapping) => {
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
							value: localValue,
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

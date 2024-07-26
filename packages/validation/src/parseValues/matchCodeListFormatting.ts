import type { SchemaField } from 'dictionary';

/**
 * Given a string value, look for any matching values in code list restrictions and return that
 * value. This is used by the convertValue functions to ensure the value returned matches the letter
 * cases of the corresponding value in the code list.
 *
 * @example
 * // Given a field `fieldWithCodeList` that has a code list restriction `["Apple", "Banana"]`
 * const originalValue = 'banana';
 * const matchingValue = matchCodeListFormatting(originalValue, fieldWithCodeList);
 *
 * // matchingValue will equal `Banana`;
 *
 * @param value
 * @param fieldDefinition
 * @returns
 */
export function matchCodeListFormatting(value: string, fieldDefinition: SchemaField): string {
	const { valueType, restrictions } = fieldDefinition;

	if (valueType === 'string') {
		const codeList = restrictions?.codeList;
		if (Array.isArray(codeList)) {
			// We have found a code list to compare to!

			// prepare the value for comparison by making it lower case
			const candidate = value.toLowerCase();

			// look for a match
			const match = codeList.find((option) => option.trim().toLowerCase() === candidate);

			if (match !== undefined) {
				// we have a match! return it!
				return match;
			}
		}
	}

	// no match was found, return original value
	return value;
}

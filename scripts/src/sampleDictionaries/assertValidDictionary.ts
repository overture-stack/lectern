import assert from 'node:assert';
import { Dictionary, replaceReferences } from '@overture-stack/lectern-dictionary';

/**
 * Asserts that a dictionary is structurally valid after reference resolution.
 *
 * Runs replaceReferences to expand all reference tags, then parses the result
 * through the Dictionary Zod schema. This catches errors that only surface after
 * resolution — for example, a reference tag that expands to a value incompatible
 * with the field type it appears in.
 *
 * Throws if validation fails, logging the Zod error details to stderr first.
 */
export const assertValidDictionary = (dictionary: Dictionary): void => {
	const resolved = replaceReferences(dictionary);
	const result = Dictionary.safeParse(resolved);

	if (!result.success) {
		console.error(
			`Dictionary '${dictionary.name}' is invalid after reference resolution: ${JSON.stringify(result.error.flatten())}`,
		);
	}
	assert(result.success, `Dictionary '${dictionary.name}' is invalid after reference resolution`);
};

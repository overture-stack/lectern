import type { ArrayTestCase } from '@overture-stack/lectern-dictionary';

/**
 * `ArrayTestCase` values dictate how many results in an array need to be successful in order for
 * an entire test to be considered a success. This function takes an array of boolean values and
 * an `ArrayTestCase` value and determine if the entire list is successful.
 *
 * The possible test case values and their behaviours are:
 * - all: every boolean in the results must be true
 * - any: at least one result must be true
 * - none: no result can be true (all must be false)
 *
 * @param results Array of booleans representing a list of test results where true is a success
 * @param testCase
 * @returns
 */
export const resultForArrayTestCase = (results: boolean[], testCase: ArrayTestCase): boolean => {
	switch (testCase) {
		case 'all': {
			return results.every((result) => result);
		}
		case 'any': {
			return results.some((result) => result);
		}
		case 'none': {
			return results.every((result) => !result);
		}
	}
};

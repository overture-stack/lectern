import type { ZodSchema } from 'zod';

/**
 * This function tests that an object is a valid example of a Lectern types, and will throw an error
 * if that validation fails. The purpose of this is to ensure that all fixtures defined for Lectern test
 * validation pass all the rules as defined in the Lectern dictionary schemas, including the rules that
 * are not enforced by the type system. For example, Schemas cannot have multiple fields with the same name,
 * and uniqueKey restrictions cannot name fields that are missing in the schema.
 *
 * By adding this validation to a fixture file, the fixture will throw an error when loaded by the test
 * runner, preventing the tests from runnign at all. Additionally, this function will output in the test
 * logs the details from the Zod validation explaining why the provided fixture is invalid.
 *
 * @example
 * // schemaExmple is a test fixture of a schema we want to use in a test:
 * export const schemaExample = {
 * 	name: 'some-schema',
 * 	description: 'Invalid schema due to repeated field',
 * 	fields: [fieldStringRequired, fieldStringRequired],
 * } as const satisfies Schema;
 *
 * // Ensure that the text fixture
 * validateFixture(schemaExample, Schema, 'schemaExample is not a valid schema.');
 *
 * @param value
 * @param schema
 * @param message
 */
export const validateFixture = <T>(value: NoInfer<T>, schema: ZodSchema<T>, message: string): void => {
	const validationResult = schema.safeParse(value);
	if (!validationResult.success) {
		throw new Error(`Fixture failed validation test. ${message}: ${JSON.stringify(validationResult.error.flatten())}`);
	}
};

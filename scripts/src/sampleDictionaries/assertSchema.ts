import assert from 'node:assert';
import type { ZodSchema } from 'zod';

/**
 * Asserts that `value` satisfies the given Zod schema at runtime. Throws if validation fails.
 *
 * Intended for use in dictionary and schema definition files to catch structural errors
 * (e.g. duplicate field names, uniqueKey references to missing fields) that the TypeScript
 * type system cannot enforce.
 *
 * On failure, logs the Zod validation error details to stderr before throwing, so the specific
 * constraint violations are visible in the output.
 *
 * @example
 * export const schemaDonor = { ... } as const satisfies Schema;
 * assertSchema(schemaDonor, Schema, 'schemaDonor is not a valid Schema');
 */
export const assertSchema = <T>(value: unknown, schema: ZodSchema<T>, message: string): void => {
	const validationResult = schema.safeParse(value);

	if (!validationResult.success) {
		console.error(`${message}: ${JSON.stringify(validationResult.error.flatten())}`);
	}
	assert(validationResult.success);
};

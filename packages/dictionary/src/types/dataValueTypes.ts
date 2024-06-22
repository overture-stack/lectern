import { z as zod } from 'zod';

export const Integer = zod.number().int();

/**
 * String rules for all name fields used in dictionary, including Dictionary, Schema, and Fields.
 * This validates the format of the string since names are not allowed to have `.` characters.
 *
 * Example Values:
 * - `donors`
 * - `primary-site`
 * - `maximumVelocity`
 */
export const NameString = zod
	.string()
	.min(1, 'Name fields cannot be empty.')
	.regex(/^[^.]+$/, 'Name fields cannot have `.` characters.');
export type NameString = zod.infer<typeof NameString>;

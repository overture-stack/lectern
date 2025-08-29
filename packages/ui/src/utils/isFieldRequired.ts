import type { SchemaField } from '@overture-stack/lectern-dictionary';

/**
 * Determine if a field is always required.
 *
 * A field is always required if the field has a root level restrictions object with `required: true`.
 * Any conditional restrictions will be ignored.
 *
 * @param field
 * @returns
 */
export function isFieldRequired(field: SchemaField): boolean {
	if (!field.restrictions) {
		return false;
	}

	if (Array.isArray(field.restrictions)) {
		return field.restrictions.reduce(
			(output, restrictions) => output || ('required' in restrictions && restrictions.required === true),
			false,
		);
	}
	return 'required' in field.restrictions && !!field.restrictions.required;
}

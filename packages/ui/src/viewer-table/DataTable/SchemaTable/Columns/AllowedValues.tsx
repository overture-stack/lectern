/** @jsxImportSource @emotion/react */
import { RestrictionRange, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

const handleRange = (range: RestrictionRange, restrictionItems: string[]) => {
	if (range.min && range.max) {
		restrictionItems.push('Min: ' + range.min + '\nMax: ' + range.max);
	} else if (range.min) {
		restrictionItems.push('Min: ' + range.min);
	} else if (range.max) {
		restrictionItems.push('Max: ' + range.max);
	} else if (range.exclusiveMin) {
		restrictionItems.push('Greater than ' + range.exclusiveMin);
	} else if (range.exclusiveMax) {
		restrictionItems.push('Less than ' + range.exclusiveMax);
	}
};

export const renderAllowedValuesColumn = (restrictions: CellContext<SchemaField, SchemaRestrictions>) => {
	const schemaField: SchemaField = restrictions.row.original;
	const restrictionsValue: SchemaRestrictions = restrictions.getValue();
	const restrictionItems: string[] = [];

	// If we have nothing we can return None
	if (!restrictionsValue || Object.keys(restrictionsValue).length === 0) {
		return 'None';
	}

	if ('if' in restrictionsValue && restrictionsValue.if) {
		restrictionItems.push('CONDITIONAL RESTRICTION, PART 5');
	}

	// Type narrowing and pushing appropriate values from the restrictions into the restrictionItems array
	if ('required' in restrictionsValue && restrictionsValue.required) {
		restrictionItems.push('Required');
	}

	if ('regex' in restrictionsValue && restrictionsValue.regex) {
		const regexValue =
			Array.isArray(restrictionsValue.regex) ? restrictionsValue.regex.join(', ') : restrictionsValue.regex;
		restrictionItems.push('Must Match Pattern: ' + regexValue + '\nSee field description for examples.');
	}

	if ('codeList' in restrictionsValue && restrictionsValue.codeList) {
		restrictionItems.push(
			Array.isArray(restrictionsValue.codeList) ? restrictionsValue.codeList.join(',\n ') : restrictionsValue.codeList,
		);
	}

	if ('range' in restrictionsValue && restrictionsValue.range) {
		handleRange(restrictionsValue.range, restrictionItems);
	}

	if (
		'range' in restrictionsValue &&
		restrictionsValue.range &&
		'codeList' in restrictionsValue &&
		restrictionsValue.codeList
	) {
	}

	if ('unique' in restrictionsValue && restrictionsValue.unique) {
		restrictionItems.push('Unique');
	}

	if (schemaField.isArray && restrictionItems.length > 0) {
		restrictionItems.push(`delimited by "${schemaField.delimiter ?? ','}"`);
	}

	if (schemaField.unique) {
		restrictionItems.push('Must be unique');
	}

	return restrictionItems.length > 0 ? restrictionItems.join('\n') : 'None';
};

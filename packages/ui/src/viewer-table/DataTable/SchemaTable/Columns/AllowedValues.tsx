/** @jsxImportSource @emotion/react */
import { MatchRuleCount, RestrictionRange, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
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

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: MatchRuleCount,
	restrictionItems: string[],
) => {
	const codeListDisplay = Array.isArray(codeList) ? codeList.join(', ') : codeList;

	if (typeof count === 'number') {
		restrictionItems.push(`Exactly ${count} from: ${codeListDisplay}`);
	} else {
		const range = count;
		if (range.min && range.max) {
			restrictionItems.push(`Select ${range.min} to ${range.max} from: ${codeListDisplay}`);
		} else if (range.min) {
			restrictionItems.push(`At least ${range.min} from: ${codeListDisplay}`);
		} else if (range.max) {
			restrictionItems.push(`Up to ${range.max} from: ${codeListDisplay}`);
		} else if (range.exclusiveMin) {
			restrictionItems.push(`More than ${range.exclusiveMin} from: ${codeListDisplay}`);
		} else if (range.exclusiveMax) {
			restrictionItems.push(`Fewer than ${range.exclusiveMax} from: ${codeListDisplay}`);
		}
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
		restrictionItems.push('Depends on');
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
		const codeListDisplay =
			Array.isArray(restrictionsValue.codeList) ? restrictionsValue.codeList.join(', ') : restrictionsValue.codeList;
		restrictionItems.push('One of: ' + codeListDisplay);
	}

	if ('range' in restrictionsValue && restrictionsValue.range) {
		handleRange(restrictionsValue.range, restrictionItems);
	}

	if (
		'codeList' in restrictionsValue &&
		restrictionsValue.codeList &&
		'count' in restrictionsValue &&
		restrictionsValue.count
	) {
		handleCodeListsWithCountRestrictions(restrictionsValue.codeList, restrictionsValue.count, restrictionItems);
	}

	if (schemaField.isArray && restrictionItems.length > 0) {
		restrictionItems.push(`delimited by "${schemaField.delimiter ?? ','}"`);
	}

	if (schemaField.unique) {
		restrictionItems.push('Must be unique');
	}

	return restrictionItems.length > 0 ? restrictionItems.join('\n') : 'None';
};

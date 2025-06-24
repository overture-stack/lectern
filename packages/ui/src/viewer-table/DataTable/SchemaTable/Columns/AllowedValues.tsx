/** @jsxImportSource @emotion/react */
import { MatchRuleCount, RestrictionRange, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';

const handleRange = (range: RestrictionRange, restrictionItems: string[]) => {
	if (range.min !== undefined && range.max !== undefined) {
		restrictionItems.push(`Min: ${range.min}\nMax: ${range.max}`);
	} else if (range.min !== undefined) {
		restrictionItems.push('Min: ' + range.min);
	} else if (range.max !== undefined) {
		restrictionItems.push('Max: ' + range.max);
	} else if (range.exclusiveMin !== undefined) {
		restrictionItems.push('Greater than ' + range.exclusiveMin);
	} else if (range.exclusiveMax !== undefined) {
		restrictionItems.push('Less than ' + range.exclusiveMax);
	}
};

const handleCodeListsWithCountRestrictions = (
	codeList: string | string[] | number[],
	count: MatchRuleCount,
	restrictionItems: string[],
	isArray: boolean,
	delimiter: string = ',',
) => {
	const codeListDisplay = Array.isArray(codeList) ? codeList.join(', ') : codeList;
	const delimiterText = isArray ? `, delimited by "${delimiter}"` : '';

	if (typeof count === 'number') {
		restrictionItems.push(`Exactly ${count}${delimiterText} from:\n ${codeListDisplay}`);
	} else {
		const range = count;
		if (range.min !== undefined && range.max !== undefined) {
			restrictionItems.push(`Select ${range.min} to ${range.max}${delimiterText} from:\n${codeListDisplay}`);
		} else if (range.min !== undefined) {
			restrictionItems.push(`At least ${range.min}${delimiterText} from:\n${codeListDisplay}`);
		} else if (range.max !== undefined) {
			restrictionItems.push(`Up to ${range.max}${delimiterText} from:\n${codeListDisplay}`);
		} else if (range.exclusiveMin !== undefined) {
			restrictionItems.push(`More than ${range.exclusiveMin}${delimiterText} from:\n${codeListDisplay}`);
		} else if (range.exclusiveMax !== undefined) {
			restrictionItems.push(`Fewer than ${range.exclusiveMax}${delimiterText} from:\n${codeListDisplay}`);
		}
	}
};

export const renderAllowedValuesColumn = (restrictions: CellContext<SchemaField, SchemaRestrictions>) => {
	const schemaField: SchemaField = restrictions.row.original;
	const restrictionsValue: SchemaRestrictions = restrictions.getValue();
	const restrictionItems: string[] = [];

	if (!restrictionsValue || Object.keys(restrictionsValue).length === 0) {
		return 'None';
	}

	if ('if' in restrictionsValue && restrictionsValue.if) {
		restrictionItems.push('Depends on');
	}

	if ('regex' in restrictionsValue && restrictionsValue.regex) {
		const regexValue =
			Array.isArray(restrictionsValue.regex) ? restrictionsValue.regex.join(', ') : restrictionsValue.regex;
		restrictionItems.push('Must match pattern: ' + regexValue + '\nSee field description for examples.');
	}

	if ('codeList' in restrictionsValue && restrictionsValue.codeList && !('count' in restrictionsValue)) {
		const codeListDisplay =
			Array.isArray(restrictionsValue.codeList) ?
				restrictionsValue.codeList.join(',\n')
			:	`"${restrictionsValue.codeList}"`;
		restrictionItems.push('One of:\n' + `${codeListDisplay}`);
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
		handleCodeListsWithCountRestrictions(
			restrictionsValue.codeList,
			restrictionsValue.count,
			restrictionItems,
			schemaField.isArray || false,
			schemaField.delimiter ?? ',',
		);
	}

	if (schemaField.unique) {
		restrictionItems.push('Must be unique');
	}

	return restrictionItems.length > 0 ? restrictionItems.join('\n') : 'None';
};

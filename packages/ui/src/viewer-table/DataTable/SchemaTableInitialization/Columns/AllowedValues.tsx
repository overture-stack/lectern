/** @jsxImportSource @emotion/react */
import { ConditionalRestriction, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import { useThemeContext } from '../../../../theme/ThemeContext';

export const renderAllowedValuesColumn = (restrictions: CellContext<SchemaField, SchemaRestrictions>) => {
	const theme = useThemeContext();

	const restrictionsValue: SchemaRestrictions = restrictions.getValue();

	const restrictionItems: string[] = []; // This is the array that we push everything into.
	// If we have nothing we can return NNone
	if (!restrictionsValue || Object.keys(restrictionsValue).length === 0) {
		return <div css={theme.typography.data}>None</div>;
	}

	if ('regex' in restrictionsValue && restrictionsValue.regex) {
		const regexValue =
			Array.isArray(restrictionsValue.regex) ? restrictionsValue.regex.join(', ') : restrictionsValue.regex;
		restrictionItems.push(regexValue);
	}

	if ('codeList' in restrictionsValue && restrictionsValue.codeList) {
		restrictionItems.push(
			Array.isArray(restrictionsValue.codeList) ? restrictionsValue.codeList.join(',\n ') : restrictionsValue.codeList,
		);
	}

	if ('range' in restrictionsValue && restrictionsValue.range) {
		restrictionItems.push(JSON.stringify(restrictionsValue.range));
	}

	if ('unique' in restrictionsValue && restrictionsValue.unique) {
		restrictionItems.push('Unique');
	}
	return restrictionItems.length > 0 ? <div>{restrictionItems.join('; ')}</div> : 'None';
};

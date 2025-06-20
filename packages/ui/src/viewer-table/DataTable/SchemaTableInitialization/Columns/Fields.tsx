/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SchemaField } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import React, { useEffect } from 'react';
import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	margin-left: 8px;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors.secondary};
	&:hover {
		opacity: 1;
	}
`;
export const renderFieldsColumn = (
	field: CellContext<SchemaField, string>,
	setClipboardContents: (curr: string) => void,
) => {
	const theme = useThemeContext();
	const fieldName = field.row.original.name;
	const fieldIndex = field.row.index;

	// In a Dictionary, there is no such thing as an examples field, however it is commonly apart of the meta
	// due to project specs, we will render the examples here if they exist and have logic to handle it.

	const renderExamples = () => {
		const examples = field.row.original.meta?.examples;
		if (!examples) {
			return null;
		}
		// the only way we can have more than one example is if we have an array of examples

		const count = Array.isArray(examples) ? examples.length : 1;
		const label = count > 1 ? 'Examples:' : 'Example:';
		const text = Array.isArray(examples) ? examples.join(', ') : String(examples);

		return (
			<div css={theme.typography.data}>
				{label} {text}
			</div>
		);
	};

	const { Hash } = theme.icons;

	useEffect(() => {
		const hashTarget = `field-${fieldIndex}`;
		if (window.location.hash === `#${hashTarget}`) {
			document.getElementById(hashTarget)?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	const handleClick = () => {
		const hashTarget = `field-${fieldIndex}`;
		window.location.hash = `#${hashTarget}`;
		setClipboardContents(window.location.href);
	};

	return (
		<div
			id={`field-${fieldIndex}`}
			css={css`
				display: flex;
				flex-direction: column;
				gap: 10px;
			`}
		>
			<div css={theme.typography.data}>
				{fieldName}
				<span css={hashIconStyle(theme)} onClick={handleClick}>
					<Hash width={20} height={20} fill={theme.colors.secondary} />
				</span>
			</div>
			<div css={theme.typography.data}>{field.row.original.description}</div>
			{renderExamples()}
		</div>
	);
};

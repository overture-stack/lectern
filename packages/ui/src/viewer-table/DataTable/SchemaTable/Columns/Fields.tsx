/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { DictionaryMeta, SchemaField, SchemaRestrictions } from '@overture-stack/lectern-dictionary';
import { CellContext } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import Pill from '../../../../common/Pill';
import { Theme } from '../../../../theme';
import { useThemeContext } from '../../../../theme/ThemeContext';
import OpenModalPill from '../OpenModalPill';

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors.secondary};
	&:hover {
		opacity: 1;
	}
`;

const fieldContainerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 10px;
	scroll-margin: 40%;
`;

export type FieldExamplesProps = {
	examples: DictionaryMeta[string];
};

export type FieldNameProps = {
	name: string;
	uniqueKeys: string[];
	index: number;
	onHashClick: () => void;
};

export type FieldDescriptionProps = {
	description: string;
};

const FieldExamples = ({ examples }: FieldExamplesProps) => {
	const theme = useThemeContext();
	if (!examples) {
		return null;
	}
	const count = Array.isArray(examples) ? examples.length : 1;
	const label = count > 1 ? 'Examples:' : 'Example:';
	const text = Array.isArray(examples) ? examples.join(', ') : String(examples);

	return (
		<div>
			<p css={theme.typography.label}>
				{label} <span css={theme.typography.data}>{text}</span>
			</p>
		</div>
	);
};

const FieldName = ({ name, onHashClick, uniqueKeys }: FieldNameProps) => {
	const theme = useThemeContext();
	const { Hash } = theme.icons;
	const displayKeys = uniqueKeys.filter((value) => value !== '');
	const fieldNameStyle = css`
		${theme.typography.label}
		display: flex;
		align-items: center;
		gap: 2px;
	`;
	return (
		<div css={fieldNameStyle}>
			{name}
			<span css={hashIconStyle(theme)} onClick={onHashClick}>
				<Hash width={10} height={10} fill={theme.colors.secondary} />
			</span>
			{displayKeys.length === 1 && <Pill size="small">{displayKeys}</Pill>}
			{displayKeys.length > 1 && <OpenModalPill title="Primary Key" />}
		</div>
	);
};

const FieldDescription = ({ description }: FieldDescriptionProps) => {
	const theme = useThemeContext();
	return <div css={theme.typography.data}>{description}</div>;
};

const useHashNavigation = (fieldIndex: number) => {
	useEffect(() => {
		const hashTarget = `field-${fieldIndex}`;
		if (window.location.hash === `#${hashTarget}`) {
			document.getElementById(hashTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [fieldIndex]);
};

const useHashClickHandler = (fieldIndex: number, setClipboardContents: (clipboardContents: string) => void) => {
	return () => {
		const hashTarget = `field-${fieldIndex}`;
		window.location.hash = `#${hashTarget}`;
		setClipboardContents(window.location.href);
	};
};

export const FieldsColumn = ({ field }: { field: CellContext<SchemaField, string> }) => {
	const fieldName = field.row.original.name;
	const fieldIndex = field.row.index;
	const fieldDescription = field.row.original.description;
	const fieldExamples = field.row.original.meta?.examples;
	const fieldRestrictions: SchemaRestrictions = field.row.original.restrictions;
	const uniqueKey = fieldRestrictions && 'uniqueKey' in fieldRestrictions ? fieldRestrictions.uniqueKey : [''];

	const [clipboardContents, setClipboardContents] = useState<string | null>(null);
	const [isCopying, setIsCopying] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = (text: string) => {
		if (isCopying) {
			return; // We don't wanna copy if we are already copying
		}
		setIsCopying(true);
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setIsCopying(false);
				}, 2000); // Reset copy success after 2 seconds as well as the isCopying state
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				setCopySuccess(false);
				setIsCopying(false);
			});
		if (copySuccess) {
			// Update the clipboard contents
			const currentURL = window.location.href;
			setClipboardContents(currentURL);
		}
		setCopySuccess(false);
	};

	useMemo(() => {
		if (clipboardContents) {
			handleCopy(clipboardContents);
		}
	}, [clipboardContents]);

	useHashNavigation(fieldIndex);
	const handleHashClick = useHashClickHandler(fieldIndex, setClipboardContents);

	return (
		<div id={`field-${fieldIndex}`} css={fieldContainerStyle}>
			<FieldName name={fieldName} index={fieldIndex} onHashClick={handleHashClick} uniqueKeys={uniqueKey as string[]} />
			{fieldDescription && <FieldDescription description={fieldDescription} />}
			{fieldExamples && <FieldExamples examples={fieldExamples} />}
		</div>
	);
};

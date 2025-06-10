/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

export type AccordionData = {
	title: string;
	description: string;
	content: ReactNode | string;
};
type AccordionItemProps = {
	data: AccordionData;
	isOpen: boolean;
	onClick: () => void;
};

const accordionItemStyle = css`
	list-style: none;
	border: 1px solid #beb2b294;
	border-radius: 9px;
	margin-bottom: 8px;
	overflow: hidden;
	transition: all 0.2s ease;
`;

const accordionItemTitleStyle = (theme: Theme) => css`
	margin: 0;
	${theme.typography?.button};
`;

const accordionItemButtonStyle = (theme: Theme, isOpen: boolean) => css`
	display: flex;
	flex-wrap: nowrap;
	white-space: nowrap;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 12px 16px;
	background-color: #f7f7f7;
	color: ${theme.colors.accent_dark};
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	${theme.typography?.button};

	&:hover {
		background-color: ${theme.colors.grey_1};
	}

	&:focus {
		outline: none;
		background-color: ${theme.colors.grey_1};
	}
`;

const chevronStyle = (isOpen: boolean) => css`
	transform: ${!isOpen ? 'rotate(-90deg)' : 'none'};
	transition: transform 0.2s ease;
	margin-left: 8px;
`;

const accordionItemContainerStyle = (height: number) => css`
	height: ${height}px;
	overflow: hidden;
	transition: height 0.2s ease;
`;

const accordionItemContentStyle = css`
	padding: 16px;
	background-color: #ffffff;
`;

const AccordionItem = ({ data, isOpen, onClick }: AccordionItemProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);
	const theme = useThemeContext();

	const { ChevronDown } = theme.icons;

	useEffect(() => {
		if (isOpen) {
			const contentEl = contentRef.current;
			if (contentEl) {
				setHeight(contentEl.scrollHeight);
			}
		} else {
			setHeight(0);
		}
	}, [isOpen]);

	return (
		<li css={accordionItemStyle}>
			<h2 css={accordionItemTitleStyle(theme)}>
				<button css={accordionItemButtonStyle(theme, isOpen)} onClick={onClick}>
					<ChevronDown fill={theme.colors?.accent_dark} width={18} height={18} style={chevronStyle(isOpen)} />
					<span>{data.title}</span>
					<span>{data.description}</span>
				</button>
			</h2>
			<div css={accordionItemContainerStyle(height)}>
				<div ref={contentRef} css={accordionItemContentStyle}>
					{data.content}
				</div>
			</div>
		</li>
	);
};
export default AccordionItem;

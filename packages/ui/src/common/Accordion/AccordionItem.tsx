/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

export type AccordionData = {
	title: string;
	openOnInit: boolean;
	description: string;
	content: ReactNode | string;
	downloadButton: ReactNode;
};
type AccordionItemProps = {
	data: AccordionData;
	isOpen: boolean;
	onClick: () => void;
	isDescriptionExpanded: boolean;
	onDescriptionToggle: () => void;
};

const accordionItemStyle = (theme: Theme) => css`
	list-style: none;
	border: 0.25px solid ${theme.colors.black};
	border-radius: 8px;
	margin-bottom: 1px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	&:hover {
		box-shadow:
			0 2px 6px rgba(0, 0, 0, 0.15),
			0 0 0 0.3px ${theme.colors.black};
	}
	transition: all 0.3s ease;
`;

const accordionItemTitleStyle = (theme: Theme) => css`
	margin: 0;
	width: 100%;
	${theme.typography?.button};
`;

const accordionItemButtonStyle = (theme: Theme, isOpen: boolean) => css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px 20px;
	background-color: ${'#ffffff'};
	color: ${theme.colors.accent_dark};
	cursor: pointer;
	transition: all 0.2s ease;
	${theme.typography?.button};
	text-align: left;
`;

const chevronStyle = (isOpen: boolean) => css`
	transform: ${isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
	transition: transform 0.2s ease;
	margin-right: 12px;
	flex-shrink: 0;
`;

const accordionItemContainerStyle = (height: number) => css`
	height: ${height}px;
	overflow: hidden;
	transition: height 0.3s ease;
`;

const accordionItemContentStyle = (theme: Theme) => css`
	padding: 30px;
	background-color: #ffffff;
`;

const contentContainerStyle = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16px;
	flex: 1;
	min-width: 0;
	max-width: calc(100% - 100px);
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography?.subheading2};
	color: ${theme.colors?.accent_dark};
	display: inline-flex;
	align-items: center;
`;

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	margin-left: 8px;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors?.secondary};

	&:hover {
		opacity: 1;
	}
`;

const descriptionStyle = (theme: Theme) => css`
	${theme.typography?.label2};
	color: ${theme.colors?.grey_5};
	padding: 4px 8px;
	word-wrap: break-word;
	overflow-wrap: break-word;
	flex: 1;
	max-width: 60%;
`;

const iconButtonContainerStyle = css`
	margin-left: auto;
	display: flex;
	flex-direction: row;
	flex-shrink: 0;
`;
const contentInnerContainerStyle = (theme: Theme) => css`
	display: flex;
	padding: 30px;
	border-left: 1px solid ${theme.colors.grey_3};
	height: fit-content;
	${theme.typography?.data};
`;

const getChevronStyle = (isExpanded: boolean) => css`
	margin-left: 4px;
	${isExpanded && `transform: rotate(180deg);`}
`;

const linkStyle = (theme: Theme) => css`
	${theme.typography?.label2}
	color: ${theme.colors?.accent_dark};
	cursor: pointer;
	display: inline-flex;
	align-items: center;

	&:hover {
		text-decoration: underline;
	}
`;

// These constants can be adjusted based on design requirements
const DESCRIPTION_THRESHOLD = 240; // Allows for ~4-5 lines of description text in accordion items

const AccordionItem = ({ data, isOpen, onClick, isDescriptionExpanded, onDescriptionToggle }: AccordionItemProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);
	const theme = useThemeContext();
	const { downloadButton, description, title, content } = data;
	const { ChevronDown, Hash } = theme.icons;

	// Determine if the description is long enough to need a toggle, based off of how many characters we want to show by default
	// according to the figma styling
	const needsToggle = description && description.length > DESCRIPTION_THRESHOLD;
	// We want to show all the text if it is not long or if it is already expanded via state variable
	const showFull = isDescriptionExpanded || !needsToggle;
	// Based off of showFull, we determine the text to show, either its the full description or a truncated version
	const textToShow = showFull ? description : description.slice(0, DESCRIPTION_THRESHOLD) + '... ';

	const showMoreEventHandler = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDescriptionToggle();
	};
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
		<li css={accordionItemStyle(theme)}>
			<h2 css={accordionItemTitleStyle(theme)}>
				<div css={accordionItemButtonStyle(theme, isOpen)} onClick={onClick}>
					<ChevronDown fill={theme.colors?.accent_dark} width={16} height={16} style={chevronStyle(isOpen)} />
					<div css={contentContainerStyle}>
						<span css={titleStyle(theme)}>
							{title}
							<span css={hashIconStyle(theme)}>
								<Hash width={20} height={20} fill={theme.colors?.secondary} />
							</span>
						</span>
						{description && (
							<>
								<span css={descriptionStyle(theme)}>
									{textToShow}
									{needsToggle && (
										<span css={linkStyle(theme)} onClick={(e) => showMoreEventHandler(e)}>
											{' '}
											{isDescriptionExpanded ? 'Read less' : 'Show more'}
											<ChevronDown
												style={getChevronStyle(isDescriptionExpanded)}
												fill={theme.colors?.accent_dark}
												width={10}
												height={10}
											/>
										</span>
									)}
								</span>
							</>
						)}
					</div>
					{downloadButton && <span css={iconButtonContainerStyle}>{downloadButton}</span>}
				</div>
			</h2>
			<div css={accordionItemContainerStyle(height)}>
				<div ref={contentRef} css={accordionItemContentStyle(theme)}>
					<div css={contentInnerContainerStyle(theme)}>{content}</div>
				</div>
			</div>
		</li>
	);
};
export default AccordionItem;

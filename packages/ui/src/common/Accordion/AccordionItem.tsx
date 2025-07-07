/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import type { RefObject } from 'react';
import { MouseEvent, useEffect, useRef } from 'react';

import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import DictionaryDownloadButton from '../../viewer-table/InteractionPanel/DownloadTemplatesButton';
import ReadMoreText from '../ReadMoreText';
import { AccordionData, AccordionOpenState, useClipboard } from './Accordion';

const MAX_LINES_BEFORE_EXPAND = 2;

export type AccordionItemProps = {
	accordionData: AccordionData;
	index: number;
	openState: AccordionOpenState;
};

const accordionItemStyle = (theme: Theme) => css`
	list-style: none;
	width: 100%;
	border-radius: 8px;
	margin-bottom: 1px;
	overflow: hidden;
	background-color: #ffffff;
	box-shadow:
		0 2px 6px rgba(70, 63, 63, 0.05),
		0 0 0 0.3px ${theme.colors.black};
	&:hover {
		box-shadow:
			0 2px 6px rgba(70, 63, 63, 0.2),
			0 0 0 0.3px ${theme.colors.black};
	}
	transition: all 0.3s ease;
`;

const accordionItemTitleStyle = css`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 24px 20px;
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
`;

const accordionItemButtonStyle = (theme: Theme) => css`
	display: flex;
	border: none;
	align-items: center;
	cursor: pointer;
	background: transparent;
	padding: 8px 0px;
`;
const titleStyle = (theme: Theme) => css`
	${theme.typography?.button};
	color: ${theme.colors.accent_dark};
	text-align: left;
`;

const chevronStyle = (isOpen: boolean) => css`
	transform: ${isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
	transition: transform 0.2s ease;
	margin-right: 12px;
`;

const contentContainerStyle = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

const titleRowStyle = css`
	display: flex;
	gap: 2px;
	align-items: center;
	margin-bottom: 10px;
	flex-direction: auto;
	flex-wrap: wrap;
`;

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	transition: opacity 0.2s ease;
	background: transparent;
	border: none;
	cursor: pointer;
	svg {
		border-bottom: 2px solid ${theme.colors.secondary};
	}
	&:hover {
		opacity: 1;
	}
`;

const descriptionWrapperStyle = (theme: Theme) => css`
	${theme.typography?.data};
	color: ${theme.colors.black};
	overflow-wrap: break-word;
	margin-left: 16px;
`;

const accordionCollapseStyle = (isOpen: boolean) => css`
	overflow: hidden;
	max-height: ${isOpen ? 'none' : '0px'};
	transition: max-height 0.3s ease;
`;

const accordionItemContentStyle = css`
	padding: 0px 30px 30px 30px;
`;

const contentInnerContainerStyle = (theme: Theme) => css`
	border-left: 1px solid ${theme.colors.grey_3};
	padding-left: 30px;
	${theme.typography?.data};
`;

const handleInitialHashCheck = (
	windowLocationHash: string,
	accordionData: AccordionData,
	openState: AccordionOpenState,
	indexString: string,
	accordionRef: RefObject<HTMLLIElement | null>,
) => {
	if (window.location.hash === windowLocationHash) {
		openState.toggle();
		accordionRef.current?.id === indexString ? accordionRef.current.scrollIntoView({ behavior: 'smooth' }) : null;
	}
};

const hashOnClick = (
	event: MouseEvent<HTMLButtonElement>,
	windowLocationHash: string,
	setClipboardContents: (currentSchema: string) => void,
) => {
	event.stopPropagation();
	event.preventDefault();
	window.location.hash = windowLocationHash;
	setClipboardContents(window.location.href);
};

const AccordionItem = ({ index, accordionData, openState }: AccordionItemProps) => {
	const accordionRef = useRef<HTMLLIElement>(null);
	const theme = useThemeContext();
	const { setClipboardContents } = useClipboard();
	const { description, title, content, schemaName } = accordionData;
	const { ChevronDown, Hash } = theme.icons;

	const indexString = index.toString();
	const windowLocationHash = `#${index}`;

	useEffect(() => {
		setTimeout(() => {
			handleInitialHashCheck(windowLocationHash, accordionData, openState, indexString, accordionRef);
		}, 100);
	}, []);

	return (
		<li ref={accordionRef} role="button" css={accordionItemStyle(theme)} id={indexString} onClick={openState.toggle}>
			<div css={accordionItemTitleStyle}>
				<div css={contentContainerStyle}>
					<div css={titleRowStyle}>
						<button css={accordionItemButtonStyle(theme)}>
							<ChevronDown
								fill={theme.colors.accent_dark}
								width={16}
								height={16}
								style={chevronStyle(openState.isOpen)}
							/>
						</button>
						<span css={titleStyle(theme)}>{title}</span>
						<button
							type="button"
							css={hashIconStyle(theme)}
							onClick={(event) => hashOnClick(event, windowLocationHash, setClipboardContents)}
						>
							<Hash width={20} height={20} fill={theme.colors.secondary} />
						</button>
						<ReadMoreText maxLines={MAX_LINES_BEFORE_EXPAND} wrapperStyle={descriptionWrapperStyle}>
							{description}
						</ReadMoreText>
					</div>
				</div>
				<div>
					{/* Mock props for the dictionary since we haven't implemented the download per schema yet */}
					<DictionaryDownloadButton
						lecternUrl=""
						version=""
						fileType="tsv"
						name={schemaName}
						iconOnly={true}
						disabled={true}
					/>
				</div>
			</div>
			<div css={accordionCollapseStyle(openState.isOpen)}>
				<div css={accordionItemContentStyle}>
					<div css={contentInnerContainerStyle(theme)}>{content}</div>
				</div>
			</div>
		</li>
	);
};

export default AccordionItem;

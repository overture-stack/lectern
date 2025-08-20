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
import { forwardRef, MouseEvent, useEffect, useRef } from 'react';

import { useClipboard } from '../../hooks/useClipboard';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import { DictionaryDownloadButton } from '../../viewer-table/InteractionPanel/DictionaryDownloadButton';
import ReadMoreText from '../ReadMoreText';
import { AccordionData, AccordionOpenState } from './Accordion';

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
	background-color: ${theme.colors.white};
	box-shadow: 0px 4px 4px 0px ${theme.shadow.accordion};
	border: 0.25px solid ${theme.colors.black};
	&:hover {
		box-shadow: 0px 4px 4px 0px ${theme.shadow.accordion};
	}
	transition: all 0.3s ease;
`;

const accordionItemTitleStyle = css`
	display: flex;
	align-items: flex-start;
	padding: 24px 30px;
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
	gap: 16px;
`;

const chevronColumnStyle = css`
	position: relative;
	top: 5px;
`;

const accordionItemButtonStyle = css`
	display: flex;
	border: none;
	align-items: center;
	cursor: pointer;
	background: transparent;
	padding: 3px;
`;

const contentColumnStyle = css`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography?.headingSmall};
	text-align: left;
	overflow-wrap: break-word;
	word-wrap: break-word;
`;

const chevronStyle = (isOpen: boolean) => css`
	transform: ${isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
	transition: transform 0.2s ease;
`;

const titleRowStyle = css`
	display: flex;
	gap: 2px;
	align-items: center;
	margin-bottom: 10px;
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
	${theme.typography.body};
	color: ${theme.colors.black};
	overflow-wrap: break-word;
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
	border-left: 2px solid ${theme.colors.grey_3};
	padding-left: 30px;
	${theme.typography?.data};
`;

const downloadButtonContainerStyle = css`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-left: auto;
`;

const handleInitialHashCheck = (
	windowLocationHash: string,
	openState: AccordionOpenState,
	indexString: string,
	accordionRef: RefObject<HTMLLIElement | null>,
) => {
	if (window.location.hash === windowLocationHash) {
		openState.toggle();
		accordionRef.current?.id === indexString ?
			accordionRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
		:	null;
	}
};

const hashOnClick = (
	event: MouseEvent<HTMLButtonElement>,
	windowLocationHash: string,
	setClipboardContents: (currentSchema: string) => void,
) => {
	event.stopPropagation();
	event.preventDefault();
	setClipboardContents(
		`${window.location.origin}${window.location.pathname}${window.location.search}${windowLocationHash}`,
	);
};

const AccordionItem = forwardRef<HTMLLIElement, AccordionItemProps>(({ index, accordionData, openState }, ref) => {
	const accordionRef = useRef<HTMLLIElement>(null);
	const theme: Theme = useThemeContext();
	const { setClipboardContents } = useClipboard();

	const { description, title, content, schemaName } = accordionData;
	console.log(schemaName);
	const { ChevronDown, Hash } = theme.icons;

	const indexString = index.toString();
	const windowLocationHash = `#${index}`;

	useEffect(() => {
		setTimeout(() => {
			handleInitialHashCheck(windowLocationHash, openState, indexString, accordionRef);
		}, 100);
	}, []);

	return (
		<li ref={ref} css={accordionItemStyle(theme)} id={indexString}>
			<div onClick={openState.toggle} role="button" css={accordionItemTitleStyle}>
				<div css={chevronColumnStyle}>
					<button css={accordionItemButtonStyle}>
						<ChevronDown fill={theme.colors.black} width={16} height={16} style={chevronStyle(openState.isOpen)} />
					</button>
				</div>
				<div css={contentColumnStyle}>
					<div css={titleRowStyle}>
						<span css={titleStyle(theme)}>{title}</span>
						<button
							type="button"
							css={hashIconStyle(theme)}
							onClick={(event) => hashOnClick(event, windowLocationHash, setClipboardContents)}
						>
							<Hash width={20} height={20} fill={theme.colors.secondary} />
						</button>
					</div>
					<ReadMoreText maxLines={MAX_LINES_BEFORE_EXPAND} wrapperStyle={descriptionWrapperStyle(theme)}>
						{description}
					</ReadMoreText>
				</div>
				{schemaName && (
					<div css={downloadButtonContainerStyle}>
						<DictionaryDownloadButton fileType="tsv" iconOnly={true} schemaName={schemaName} />
					</div>
				)}
			</div>
			<div css={accordionCollapseStyle(openState.isOpen)}>
				<div css={accordionItemContentStyle}>
					<div css={contentInnerContainerStyle(theme)}>{content}</div>
				</div>
			</div>
		</li>
	);
});

AccordionItem.displayName = 'AccordionItem';

export default AccordionItem;

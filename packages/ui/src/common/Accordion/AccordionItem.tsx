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
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import ReadMoreText from '../ReadMoreText';

const MAX_LINES_BEFORE_EXPAND = 2;

export type AccordionData = {
	title: string;
	openOnInit: boolean;
	description: string;
	content: ReactNode | string;
	downloadButton?: ReactNode;
};

export type AccordionItemProps = {
	setClipboardContents: (currentSchema: string) => void;
	data: AccordionData;
	isOpen: boolean;
	onClick: () => void;
	index: number; // Index of the accordion item, used for accessibility and unique identification to avoid the issue with duplicates
	setIsOpen: (index: number) => void;
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

const accordionItemTitleStyle = css`
	margin: 0;
	width: 100%;
`;

const accordionItemButtonStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px 20px;
	background-color: #ffffff;
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

const contentContainerStyle = css`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 16px;
	flex: 1;
	min-width: 0;
	flex-wrap: wrap;
	max-width: calc(100% - 100px);
`;

const titleStyle = css`
	display: flex;
	align-items: center;
`;

const hashIconStyle = (theme: Theme) => css`
	opacity: 0;
	margin-left: 8px;
	transition: opacity 0.2s ease;
	border-bottom: 2px solid ${theme.colors.secondary};
	&:hover {
		opacity: 1;
	}
`;

const descriptionWrapperStyle = (theme: Theme) => css`
	${theme.typography?.label2};
	color: ${theme.colors.grey_5};
	padding: 4px 8px;
	word-wrap: break-word;
	overflow-wrap: break-word;
`;

const accordionCollapseStyle = (isOpen: boolean) => css`
	overflow: hidden;
	max-height: ${isOpen ? '800px' : '0px'};
	transition: max-height 0.3s ease;
`;

const accordionItemContentStyle = (theme: Theme) => css`
	padding: 30px;
	background-color: #ffffff;
`;

const contentInnerContainerStyle = (theme: Theme) => css`
	border-left: 1px solid ${theme.colors.grey_3};
	padding-left: 30px;
	${theme.typography?.data};
`;

const AccordionItem = ({ index, data, isOpen, onClick, setClipboardContents, setIsOpen }: AccordionItemProps) => {
	const theme = useThemeContext();
	const { downloadButton, description, title, content } = data;
	const { ChevronDown, Hash } = theme.icons;
	useEffect(() => {
		if (window.location.hash === `#${index}`) {
			if (!data.openOnInit) {
				setIsOpen(index);
			}
			document.getElementById(index.toString())?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);
	return (
		<li css={accordionItemStyle(theme)} id={index.toString()}>
			<h2 css={accordionItemTitleStyle}>
				<div css={accordionItemButtonStyle(theme)} onClick={onClick}>
					<ChevronDown fill={theme.colors.accent_dark} width={16} height={16} style={chevronStyle(isOpen)} />
					<div css={contentContainerStyle}>
						<span css={titleStyle}>
							{title}
							<span
								css={hashIconStyle(theme)}
								onClick={() => {
									window.location.hash = `#${index}`;
									setClipboardContents(window.location.href);
								}}
							>
								<Hash width={20} height={20} fill={theme.colors.secondary} />
							</span>
						</span>
						{description && (
							<ReadMoreText maxLines={MAX_LINES_BEFORE_EXPAND} wrapperStyle={descriptionWrapperStyle}>
								{description}
							</ReadMoreText>
						)}
					</div>
					{downloadButton}
				</div>
			</h2>
			<div css={accordionCollapseStyle(isOpen)}>
				<div css={accordionItemContentStyle(theme)}>
					<div css={contentInnerContainerStyle(theme)}>{content}</div>
				</div>
			</div>
		</li>
	);
};

export default AccordionItem;

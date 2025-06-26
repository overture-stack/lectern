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
import { ReactNode, useEffect, useRef, useState } from 'react';
import type { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';

export type ReadMoreTextProps = {
	children: ReactNode;
	maxLines?: number;
	wrapperStyle?: (theme: Theme) => any;
	onToggleClick?: (e: React.MouseEvent) => void;
	expandedText?: string;
	collapsedText?: string;
};

const defaultWrapperStyle = (theme: Theme) => css`
	${theme.typography?.label2};
	color: ${theme.colors.grey_5};
	padding: 4px 8px;
	word-wrap: break-word;
	overflow-wrap: break-word;
`;

const linkStyle = (theme: Theme) => css`
	${theme.typography?.label};
	color: ${theme.colors.black};
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	background: none;
	border: none;
	padding: 0;
	margin-top: 4px;

	&:hover {
		text-decoration: underline;
	}
`;

const clampingLogic = (isExpanded: boolean, maxLines: number) => css`
	${!isExpanded &&
	`
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: ${maxLines};
		overflow: hidden;
	`}
`;

const getChevronStyle = (isExpanded: boolean) => css`
	margin-left: 4px;
	${isExpanded && `transform: rotate(180deg);`}
`;

const ReadMoreText = ({
	children,
	maxLines = 2,
	wrapperStyle,
	onToggleClick,
	expandedText = 'Read less',
	collapsedText = 'Show more',
}: ReadMoreTextProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [needsToggle, setNeedsToggle] = useState(false);
	const theme = useThemeContext();
	const { ChevronDown } = theme.icons;

	useEffect(() => {
		if (contentRef.current) {
			const div = contentRef.current;
			setNeedsToggle(div.scrollHeight > div.clientHeight + 1);
		}
	}, [children]);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
		onToggleClick?.(e);
	};

	const appliedWrapperStyle = wrapperStyle || defaultWrapperStyle;

	return (
		<div css={appliedWrapperStyle(theme)}>
			<div ref={contentRef} css={clampingLogic(isExpanded, maxLines)}>
				{children}
			</div>

			{needsToggle && (
				<button onClick={handleToggle} css={linkStyle(theme)}>
					{isExpanded ? expandedText : collapsedText}
					<ChevronDown fill={theme.colors.accent_dark} width={10} height={10} style={getChevronStyle(isExpanded)} />
				</button>
			)}
		</div>
	);
};

export default ReadMoreText;

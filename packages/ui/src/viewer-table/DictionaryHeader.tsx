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
import React, { useState } from 'react';
import { css } from '@emotion/react';
import colours from './styles/colours';
import { useThemeContext } from '../theme/ThemeContext';

type DictionaryHeaderProps = {
	name: string;
	description?: string;
	version?: string;
};

const getChevronStyle = (isExpanded: boolean) => css`
	margin-left: 4px;
	${isExpanded && `transform: rotate(180deg);`}
`;

const linkStyle = (theme: any) => css`
	${theme.typography?.label2}
	color: white;
	cursor: pointer;
	margin-left: 6px;
	display: inline-flex;
	align-items: center;

	&:hover {
		text-decoration: underline;
	}
`;
const descriptionStyle = (theme: any) => css`
	${theme.typography?.data}
	color: white;
	margin: 0;
	display: inline;
`;

const containerStyle = (theme: any) => css`
	background-color: ${colours.accent1_1};
	${theme.typography.heading}
	display: flex;
	width: 100%;
	margin-bottom: 1rem;
	padding: 2.5rem;
`;

const rowLayoutStyle = css`
	display: flex;
	flex-direction: row;
	width: 100%;
`;

const titleColumnStyle = css`
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-right: 2rem;
`;

const titleStyle = css`
	font-weight: 700;
	font-size: 40px;
	color: white;
	line-height: 100%;
	margin: 0;
	margin-bottom: 0.5rem;
`;

const versionStyle = (theme: any) => css`
	${theme.typography.data}
	color: white;
`;

const descriptionColumnStyle = css`
	flex: 2;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const descriptionContainerStyle = css`
	margin: 0;
`;

// These constants can be adjusted based on design requirements
const DESCRIPTION_THRESHOLD = 220;
const MAX_CHARS_VISIBLE = 240;

const DictionaryHeader = ({ name, description, version }: DictionaryHeaderProps) => {
	const theme = useThemeContext();
	const { ChevronDown } = theme.icons;
	const [isExpanded, setIsExpanded] = useState(false);

	// Determine if the description is long enough to need a toggle, based off of how many characters we want to show by default
	// according to the figma styling
	const needsToggle = description && description.length > DESCRIPTION_THRESHOLD;
	// We want to show all the text if it is not long or if it is already expanded via state variable
	const showFull = isExpanded || !needsToggle;
	// Based off of showFull, we determine the text to show, either its the full description or a truncated version
	const textToShow = showFull ? description : description.slice(0, MAX_CHARS_VISIBLE) + '...';

	return (
		<div css={containerStyle(theme)}>
			<div css={rowLayoutStyle}>
				<div css={titleColumnStyle}>
					<h1 css={titleStyle}>{name}</h1>
					{version && <span css={versionStyle(theme)}>v{version}</span>}
				</div>

				{description && (
					<div css={descriptionColumnStyle}>
						<div css={descriptionContainerStyle}>
							<span css={descriptionStyle(theme)}>{textToShow}</span>
							{needsToggle && (
								<span css={linkStyle(theme)} onClick={() => setIsExpanded((prev) => !prev)}>
									{isExpanded ? 'Read less' : 'Show more'}
									<ChevronDown style={getChevronStyle(isExpanded)} fill="white" width={10} height={10} />
								</span>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DictionaryHeader;

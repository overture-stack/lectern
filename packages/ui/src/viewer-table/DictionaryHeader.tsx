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
import type { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
import ReadMoreText from '../common/ReadMoreText';

export type DictionaryHeaderProps = {
	name: string;
	description?: string;
	version?: string;
};

const descriptionWrapperStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmall}
	color: white;
	padding: 0;
	button {
		${theme.typography.paragraphSmallBold}
		color: white;
		margin-top: 4px;
		&:hover {
			text-decoration: underline;
		}
		svg {
			fill: white;
		}
	}
`;

const containerStyle = (theme: Theme) => css`
	background-color: ${theme.colors.accent_dark};
	display: flex;
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

const titleStyle = (theme: Theme) => css`
	${theme.typography.subtitle}
	color: white;
	margin: 0;
	margin-bottom: 0.5rem;
`;

const versionStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmall}
	color: white;
`;

const descriptionColumnStyle = css`
	flex: 2;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const DictionaryHeader = ({ name, description, version }: DictionaryHeaderProps) => {
	const theme = useThemeContext();

	return (
		<div css={containerStyle(theme)}>
			<div css={rowLayoutStyle}>
				<div css={titleColumnStyle}>
					<h1 css={titleStyle(theme)}>{name}</h1>
					{version && <span css={versionStyle(theme)}>{version}</span>}
				</div>
				{description && (
					<div css={descriptionColumnStyle}>
						<ReadMoreText
							maxLines={2}
							wrapperStyle={descriptionWrapperStyle}
							expandedText="Read less"
							collapsedText="Show more"
						>
							{description}
						</ReadMoreText>
					</div>
				)}
			</div>
		</div>
	);
};

export default DictionaryHeader;

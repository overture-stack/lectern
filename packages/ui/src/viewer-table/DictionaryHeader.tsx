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

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ReadMoreText from '../common/ReadMoreText';
import type { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';

export type DictionaryHeaderProps = {
	name: string;
	description?: string;
	version?: string;
	disabled?: boolean;
	isLoading?: boolean;
};

const descriptionWrapperStyle = (theme: Theme) => css`
	${theme.typography.body}
	color: ${theme.colors.accent_dark};
	padding: 0;
	button {
		${theme.typography.bodyBold}
		color: ${theme.colors.accent_dark};
		margin-top: 4px;
		&:hover {
			text-decoration: underline;
		}
		svg {
			fill: ${theme.colors.accent_dark};
		}
	}
`;

const containerStyle = css`
	background-color: white;
	padding: 2.5rem;
	margin: 0;
	border-bottom: 1px solid #d1d8df;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography.subtitleBold}
	color: ${theme.colors.accent_dark};
	margin: 0;
`;

const versionStyle = (theme: Theme) => css`
	${theme.typography.bodyBold}
	color: ${theme.colors.accent_dark};
`;

const HeaderSkeleton = ({ gradient }: { gradient: string }) => {
	const theme: Theme = useThemeContext();
	return (
		<SkeletonTheme customHighlightBackground={gradient} baseColor="transparent">
			<h1 css={titleStyle(theme)}>
				<Skeleton width={360} />
			</h1>
			<Skeleton count={2} height={16} style={{ marginTop: 4, marginBottom: 4 }} />
			<Skeleton width={180} />
		</SkeletonTheme>
	);
};

const DictionaryHeader = ({ name, description, version, disabled, isLoading }: DictionaryHeaderProps) => {
	const theme: Theme = useThemeContext();

	if (disabled) {
		return <div css={containerStyle} />;
	}
	const gradient = `linear-gradient(270deg, rgba(229, 237, 243, 0) 0%, ${theme.colors.accent_1} 100%)`;

	return (
		<div css={containerStyle}>
			{isLoading ?
				<HeaderSkeleton gradient={gradient} />
			:	<>
					<h1 css={titleStyle(theme)}>{name}</h1>
					{description && (
						<ReadMoreText
							maxLines={2}
							wrapperStyle={descriptionWrapperStyle(theme)}
							expandedText="Read less"
							collapsedText="Show more"
						>
							{description}
						</ReadMoreText>
					)}
					{version && <span css={versionStyle(theme)}>{version}</span>}
				</>
			}
		</div>
	);
};

export default DictionaryHeader;

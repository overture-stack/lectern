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

import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

const pageContainerStyle = (theme: Theme) => css`
	margin: 0 auto;
	min-height: calc(100vh - ${theme.dimensions.navbar.height}px - ${theme.dimensions.footer.height}px);
	padding: 0 16px 40px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const headerPanelBlockStyle = css`
	display: flex;
	flex-direction: column;
	gap: 0;
`;

const loadingContentStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	gap: 24px;
`;

const loadingTextStyles = (theme: Theme) => css`
	${theme.typography.bodyBold}
	color: ${theme.colors.accent};
	margin: 0;
`;

const HeaderSkeleton = () => {
	const theme = useThemeContext();
	return (
		<SkeletonTheme
			customHighlightBackground={`linear-gradient(270deg, rgba(229, 237, 243, 0) 0%, ${theme.colors.accent_1} 100%)`}
			baseColor="transparent"
		>
			<div
				css={css`
					padding: 24px 0;
					border-bottom: 1px solid ${theme.colors.border_muted};
				`}
			>
				<Skeleton width={300} height={32} style={{ marginBottom: '8px' }} />
				<Skeleton width={500} height={16} />
				<Skeleton width={120} height={14} style={{ marginTop: '8px' }} />
			</div>
		</SkeletonTheme>
	);
};

const InteractionPanelSkeleton = () => {
	const theme = useThemeContext();
	return (
		<SkeletonTheme
			customHighlightBackground={`linear-gradient(270deg, rgba(229, 237, 243, 0) 0%, ${theme.colors.accent_1} 100%)`}
			baseColor="transparent"
		>
			<div
				css={css`
					display: flex;
					width: 100%;
					align-items: center;
					justify-content: space-between;
					padding: 8px 16px;
					border-top: 1px solid ${theme.colors.border_muted};
					border-bottom: 1px solid ${theme.colors.border_muted};
					background-color: ${theme.colors.white};
					min-height: 80px;
				`}
			>
				<div
					css={css`
						display: flex;
						align-items: center;
						gap: 16px;
					`}
				>
					<Skeleton width={160} height={42} inline />
					<Skeleton width={120} height={42} inline />
					<Skeleton width={120} height={42} inline />
				</div>
			</div>
		</SkeletonTheme>
	);
};

const LoadingPage = () => {
	const theme: Theme = useThemeContext();

	return (
		<div css={pageContainerStyle(theme)}>
			<div css={headerPanelBlockStyle}>
				<HeaderSkeleton />
				<InteractionPanelSkeleton />
			</div>
			<div css={loadingContentStyles}>
				<LoadingSpinner size={69} />
				<p css={loadingTextStyles(theme)}>Loading...</p>
			</div>
		</div>
	);
};

export default LoadingPage;

/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
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

import { type Theme, useThemeContext } from '../../theme/index';

const containerStyle = css`
	background-color: white;
	padding: 2.5rem;
	margin: 0;
	border-bottom: 1px solid #d1d8df;
	display: flex;
	flex-direction: column;
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography.subtitleBold}
	color: ${theme.colors.accent_dark};
	margin: 0;
`;

const HeaderSkeleton = () => {
	const theme: Theme = useThemeContext();
	return (
		<div css={containerStyle}>
			<SkeletonTheme
				customHighlightBackground={theme.colors.gradients.skeleton(theme.colors.accent_1)}
				baseColor="transparent"
			>
				<h1 css={titleStyle(theme)}>
					<Skeleton width="16.67%" />
				</h1>
				<Skeleton width="16.67%" height={16} style={{ marginTop: 10, marginBottom: 10 }} />
				<Skeleton width="16.67%" />
			</SkeletonTheme>
		</div>
	);
};

export default HeaderSkeleton;

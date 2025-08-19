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

import { css, keyframes } from '@emotion/react';

import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

const spin = keyframes`
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
`;

const containerStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 24px;
`;

const spinnerStyles = css`
	animation: ${spin} 1.5s linear infinite;
`;

const loadingTextStyles = (theme: Theme) => css`
	${theme.typography.bodyBold}
	color: ${theme.colors.accent};
	margin: 0;
`;

interface LoadingSpinnerProps {
	size?: number;
}

const LoadingSpinner = ({ size = 69 }: LoadingSpinnerProps) => {
	const theme: Theme = useThemeContext();

	return (
		<div css={containerStyles}>
			<svg
				width={size}
				height={size}
				viewBox="0 0 69 69"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				css={spinnerStyles}
			>
				<path
					d="M62 34.5C62 19.3122 49.6878 7 34.5 7C19.3122 7 7 19.3122 7 34.5C7 49.6878 19.3122 62 34.5 62"
					stroke="url(#paint0_linear_3883_1093)"
					strokeWidth="13"
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_3883_1093"
						x1="70.8272"
						y1="23.9753"
						x2="39.3529"
						y2="55.5294"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#F5F7F8" />
						<stop offset="1" stopColor="#E5EDF3" />
					</linearGradient>
				</defs>
			</svg>
			<p css={loadingTextStyles(theme)}>Loading...</p>
		</div>
	);
};

export default LoadingSpinner;

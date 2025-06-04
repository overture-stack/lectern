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
import React, { ReactNode } from 'react';
import { css } from '@emotion/react';

import { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';

type ButtonProps = {
	children?: ReactNode;
	disabled?: boolean;
	onClick?: (
		e: React.SyntheticEvent<HTMLButtonElement>,
	) => any | ((e: React.SyntheticEvent<HTMLButtonElement>) => Promise<any>);
	isAsync?: boolean;
	className?: string;
	isLoading?: boolean;
};

const getButtonStyles = (theme: Theme) => css`
	color: ${theme.colors.white};
	background-color: ${theme.colors.accent};
	${theme.typography.subheading2};
	line-height: 24px;
	border-radius: 5px;
	border: 1px solid ${theme.colors.accent};
	padding: 6px 15px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	position: relative;

	&:hover {
		background-color: ${theme.colors.accent_dark};
	}

	&:disabled,
	&:disabled:hover {
		background-color: ${theme.colors.grey_4};
		cursor: not-allowed;
		color: ${theme.colors.white};
		border: 1px solid ${theme.colors.grey_4};
	}
`;

const getContentStyles = (shouldShowLoading: boolean) => css`
	visibility: ${shouldShowLoading ? 'hidden' : 'visible'};
`;

const getSpinnerStyles = (theme: Theme, shouldShowLoading: boolean) => css`
	position: absolute;
	visibility: ${shouldShowLoading ? 'visible' : 'hidden'};
	bottom: 1px;
`;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			onClick = () => {},
			disabled = false,
			isAsync = false,
			className,
			isLoading: controlledLoading,
		}: ButtonProps,
		ref,
	) => {
		const [internalLoading, setInternalLoading] = React.useState(false);

		const shouldShowLoading = !!controlledLoading || (internalLoading && isAsync);

		const handleClick = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
			setInternalLoading(true);
			await onClick(event);
			setInternalLoading(false);
		};
		const theme = useThemeContext();
		const { Spinner } = theme.icons;
		return (
			<button
				ref={ref}
				onClick={isAsync ? handleClick : onClick}
				disabled={disabled || shouldShowLoading}
				className={className}
				css={getButtonStyles(theme)}
			>
				<span css={getContentStyles(shouldShowLoading)}>{children}</span>
				<span css={getSpinnerStyles(theme, shouldShowLoading)}>
					<Spinner height={20} width={20} />
				</span>
			</button>
		);
	},
);

export default Button;

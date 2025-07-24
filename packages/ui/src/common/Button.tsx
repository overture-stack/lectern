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
import { css, SerializedStyles } from '@emotion/react';
import React, { ReactNode } from 'react';
import { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';

export interface ButtonProps {
	children?: ReactNode;
	disabled?: boolean;
	styleOverride?: SerializedStyles;
	onClick?: (
		e: React.SyntheticEvent<HTMLButtonElement>,
	) => any | ((e: React.SyntheticEvent<HTMLButtonElement>) => Promise<any>);
	isAsync?: boolean;
	className?: string;
	isLoading?: boolean;
	icon?: ReactNode;
	width?: string;
	iconOnly?: boolean;
}

const getButtonContainerStyles = (theme: any, width?: string, styleOverride?: SerializedStyles) => css`
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: center;
	gap: 11px;
	width: ${width || 'auto'};
	min-width: fit-content;
	padding: 8px 16px;
	background-color: ${theme.colors.background_light};
	color: ${theme.colors.black};
	border: 2px solid ${theme.colors.border_button};
	border-radius: 9px;
	height: 42px;
	box-sizing: border-box;
	cursor: pointer;
	position: relative;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${theme.colors.grey_1};
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}
	${styleOverride}
`;

const getContentStyles = (theme: Theme, shouldShowLoading: boolean) => css`
	display: flex;
	align-items: center;
	gap: 8px;
	${theme.typography.subtitleSecondary};
	color: inherit;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	visibility: ${shouldShowLoading ? 'hidden' : 'visible'};
`;

const getSpinnerStyles = (shouldShowLoading: boolean) => css`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	visibility: ${shouldShowLoading ? 'visible' : 'hidden'};
`;

const getIconStyles = () => css`
	display: flex;
	align-items: center;
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
			icon,
			width,
			iconOnly = false,
			styleOverride,
		}: ButtonProps,
		ref,
	) => {
		const [internalLoading, setInternalLoading] = React.useState(false);
		const theme = useThemeContext();
		const { Spinner } = theme.icons;

		const shouldShowLoading = !!controlledLoading || (internalLoading && isAsync);
		const handleClick = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
			setInternalLoading(true);
			await onClick(event);
			setInternalLoading(false);
		};
		return (
			<button
				ref={ref}
				onClick={isAsync ? handleClick : onClick}
				disabled={disabled || shouldShowLoading}
				className={className}
				css={getButtonContainerStyles(theme, width, styleOverride)}
			>
				{icon && !shouldShowLoading && <span css={getIconStyles()}>{icon}</span>}
				{/* If iconOnly is true, we don't show the children */}
				{!iconOnly && <span css={getContentStyles(theme, shouldShowLoading)}>{children}</span>}
				<span css={getSpinnerStyles(shouldShowLoading)}>
					<Spinner height={20} width={20} />
				</span>
			</button>
		);
	},
);

export default Button;

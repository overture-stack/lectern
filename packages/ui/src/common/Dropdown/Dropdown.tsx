/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { css, type SerializedStyles } from '@emotion/react';
import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { type Theme, useThemeContext } from '../../theme/index';

const disabledButtonStyle = css`
	cursor: not-allowed;
	opacity: 0.7;
`;

const dropdownButtonStyle = ({
	theme,
	width,
	disabled,
	styles,
}: {
	theme: Theme;
	width?: string;
	disabled?: boolean;
	styles?: SerializedStyles;
}) => css`
	display: flex;
	flex-wrap: nowrap;
	white-space: nowrap;
	align-items: center;
	justify-content: center;
	gap: 11px;
	width: ${width || 'auto'};
	min-width: fit-content;
	padding: 2px 12px;
	background-color: ${theme.colors.background_light};
	color: ${theme.colors.accent_dark};
	border: 2px solid ${theme.colors.border_button};
	border-radius: 9px;
	box-sizing: border-box;
	cursor: pointer;
	transition: all 0.2s ease;
	z-index: 1000;
	opacity: 1;
	&:hover {
		background-color: ${theme.colors.accent_1};
	}

	${disabled && disabledButtonStyle}
	${styles}
`;

const parentStyle = css`
	position: relative;
	display: inline-block;
`;

const dropDownTitleStyle = ({ theme, size }: { theme: Theme; size: number }) => css`
	${theme.typography.buttonText};
	font-size: ${size}px;
	color: ${theme.colors.accent_dark};
`;

const dropdownMenuStyle = (theme: Theme) => css`
	${theme.typography?.subtitleSecondary};
	position: absolute;
	top: calc(100% + 6px);
	left: 0;
	width: 100%;
	background-color: ${theme.colors.background_light};
	border: 2px solid ${theme.colors.border_button};
	border-radius: 9px;
	box-sizing: border-box;
	z-index: 100;
	max-height: 300px;
	overflow-y: auto;
	margin: 0;
	padding: 0;
`;

export type DropDownProps = {
	title?: string;
	leftIcon?: ReactNode;
	disabled?: boolean;
	size?: number;
	styles?: SerializedStyles;
	children?: ReactNode;
	closeOnSelect?: boolean;
};

/**
 * Dropdown component with toggle button and collapsible menu.
 *
 * @param {DropDownProps} props - Dropdown configuration
 * @param {string} title - Text displayed on the dropdown button
 * @param {ReactNode} leftIcon - Custom icon displayed on the left side
 * @param {boolean} disabled - Whether the dropdown is disabled
 * @param {number} size - Font size for title and icon dimensions in pixels
 * @param {SerializedStyles} styles - Custom Emotion CSS styles applied to the button
 * @param {ReactNode} children - Content rendered inside the dropdown panel
 * @param {boolean} closeOnSelect - Whether clicking inside the panel closes the dropdown
 * @returns {JSX.Element} Dropdown component
 */
const Dropdown = ({
	title,
	leftIcon,
	disabled = false,
	size = 16,
	styles,
	children,
	closeOnSelect = true,
}: DropDownProps) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const theme: Theme = useThemeContext();

	const { ChevronDown } = theme.icons;

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [open]);

	const handleToggle = useCallback(
		(event: ReactMouseEvent) => {
			if (disabled) return;
			event.stopPropagation();
			setOpen((prev) => !prev);
		},
		[disabled],
	);

	return (
		<div ref={dropdownRef} css={parentStyle}>
			<button
				css={dropdownButtonStyle({ theme, disabled, styles })}
				onClick={handleToggle}
				aria-haspopup="menu"
				aria-expanded={open}
				disabled={disabled}
			>
				{leftIcon}
				<span css={dropDownTitleStyle({ theme, size })}>{title}</span>
				<ChevronDown fill={theme.colors?.accent_dark} width={size} height={size} />
			</button>
			{open && !disabled && (
				<div css={dropdownMenuStyle(theme)} onClick={closeOnSelect ? () => setOpen(false) : undefined}>
					{children}
				</div>
			)}
		</div>
	);
};

export default Dropdown;

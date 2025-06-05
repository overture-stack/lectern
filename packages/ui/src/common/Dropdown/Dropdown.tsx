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
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import DropDownItem from './DropdownItem';
import { useThemeContext } from '../../theme/ThemeContext';
import type { Theme } from '../../theme';

const dropdownButtonStyle = (theme: Theme, width?: string) => css`
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: center;
	gap: 11px;
	width: ${width || 'auto'};
	min-width: fit-content;
	padding: 8px 16px;
	background-color: #f7f7f7;
	color: ${theme.colors.accent_dark};
	border: 1px solid #beb2b294;
	border-radius: 9px;
	font-size: 14px;
	height: 42px;
	box-sizing: border-box;
	cursor: pointer;
	transition: all 0.2s ease;
`;

const parentStyle = css`
	position: relative;
	display: inline-block;
`;

const chevronStyle = (open: boolean) => css`
	transform: ${open ? 'rotate(180deg)' : 'none'};
	transition: transform 0.2s ease;
`;

const dropDownTitleStyle = (theme: Theme) => css`
	${theme.typography?.heading};
	color: ${theme.colors.accent_dark};
`;

const dropdownMenuStyle = (theme: Theme) => css`
	${theme.typography?.heading};
	position: absolute;
	top: calc(100% + 5px);
	width: 100%;
	background-color: #f7f7f7;
	border: 1px solid #beb2b294;
	padding-top: 5px;
	border-radius: 9px;
	padding-bottom: 5px;
`;

type MenuItem = {
	label: string;
	action: () => void;
};

type DropDownProps = {
	title?: string;
	leftIcon?: ReactNode;
	menuItems?: MenuItem[];
};

const Dropdown = ({ menuItems = [], title, leftIcon }: DropDownProps) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const theme = useThemeContext();

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

	const handleToggle = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		setOpen((prev) => !prev);
	}, []);

	const renderMenuItems = () => {
		return menuItems.map(({ label, action }) => (
			<DropDownItem key={label} action={action}>
				{label}
			</DropDownItem>
		));
	};

	return (
		<div ref={dropdownRef} css={parentStyle}>
			<div>
				<div css={dropdownButtonStyle(theme)} onClick={handleToggle}>
					{leftIcon}
					<span css={dropDownTitleStyle(theme)}>{title}</span>
					<ChevronDown fill={theme.colors?.accent_dark} width={18} height={18} style={chevronStyle(open)} />
				</div>

				{/* {open && <>{renderMenuItems()}</>} */}
				{open && <div css={dropdownMenuStyle(theme)}>{renderMenuItems()}</div>}
			</div>
		</div>
	);
};

export default Dropdown;

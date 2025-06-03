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
import { FC, ReactNode } from 'react';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

type DropDownItemProps = {
	action?: string | (() => void);
	children: ReactNode;
	customStyles?: {
		hover?: SerializedStyles;
		base?: SerializedStyles;
	};
};

const styledListItemStyle = (theme: Theme, customStyles?: any) => css`
	display: flex;
	max-height: 42px;
	min-height: 100%;
	height: 100%;
	align-items: center;
	padding: 8px;
	justify-content: center;
	color: ${theme.colors?.black};
	background-color: #f7f7f7;
	border: 1px solid ${theme.colors.grey_1};
	text-decoration: none;
	cursor: pointer;
	border: none;
	&:hover {
		background-color: ${theme.colors.grey_2};
	}
	${customStyles?.base}
`;

const DropDownItem = ({ children, action, customStyles }: DropDownItemProps) => {
	const theme = useThemeContext();
	const content = <div css={styledListItemStyle(theme, customStyles)}>{children}</div>;
	if (typeof action === 'function') {
		return (
			<a onClick={action} css={styledListItemStyle(theme, customStyles)}>
				{children}
			</a>
		);
	}

	return content;
};

export default DropDownItem;

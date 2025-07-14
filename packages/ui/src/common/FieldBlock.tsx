/*
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
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { CSSProperties, ReactNode } from 'react';

import { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';

export interface InlineCodeProps {
	children: ReactNode;
	style?: CSSProperties;
}

const fieldBlockStyles = (theme: Theme) => css`
	${theme.typography.data}
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 2px 5px;
	border-radius: 3px;
	background-color: #ececec;
	border: 0.5px solid black;
	transition: all 0.2s ease-in-out;
	width: fit-content;
	text-align: center;
	color: ${theme.colors.accent_dark};
	font-family: 'DM Mono', monospace;
`;

const FieldBlock = ({ children, style }: InlineCodeProps) => {
	const theme: Theme = useThemeContext();
	return (
		<span css={fieldBlockStyles(theme)} style={style}>
			{children}
		</span>
	);
};

export default FieldBlock;

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
import { ReactNode } from 'react';
import { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
import Eye from '../theme/icons/Eye';

export type OpenModalButtonProps = {
	onClick?: (
		e: React.SyntheticEvent<HTMLButtonElement>,
	) => any | ((e: React.SyntheticEvent<HTMLButtonElement>) => Promise<any>);
	children: ReactNode;
};

const pillButtonStyle = (theme: Theme) => css`
	${theme.typography.subheading2}
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 5px;
	background-color: #ffff;
	color: ${theme.colors.black};
	border: 1px solid ${theme.colors.black};
	transition: all 0.2s ease-in-out;
	max-width: 120px;
	text-align: center;
	word-wrap: break-word;
	overflow-wrap: break-word;
	hyphens: auto;
	white-space: pre-line;
	cursor: pointer;
	&:hover {
		background: #f5f5f5;
	}
`;

const OpenModalButton = ({ onClick, children }: OpenModalButtonProps) => {
	const theme: Theme = useThemeContext();

	return (
		<button onClick={onClick} css={pillButtonStyle(theme)}>
			<Eye />
			{children}
		</button>
	);
};

export default OpenModalButton;

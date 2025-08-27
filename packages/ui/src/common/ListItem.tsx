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
import { type ReactNode } from 'react';

import { type Theme, useThemeContext } from '../theme/index';

import Pill from './Pill';

export interface ListItemProps {
	children: ReactNode;
}

const listItemStyles = (theme: Theme) => css`
	border: 1px solid ${theme.colors.black};
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	background-color: #ececec;
	width: fit-content;
	max-width: none;
	${theme.typography.fieldBlock}
`;

const ListItem = ({ children }: ListItemProps) => {
	const theme: Theme = useThemeContext();
	return (
		<Pill size="small" customStyles={listItemStyles(theme)}>
			{children}
		</Pill>
	);
};

export default ListItem;

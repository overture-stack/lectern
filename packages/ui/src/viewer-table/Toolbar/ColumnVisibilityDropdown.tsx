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

import { css } from '@emotion/react';

import Dropdown from '../../common/Dropdown/index';
import { type Theme, useThemeContext } from '../../theme/index';

export type ColumnVisibilityDropdownProps = {
	columnHeaders: string[];
	columnVisibility: Record<string, boolean>;
	onToggle: (columnHeader: string) => void;
};

const checkboxRowStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px;
	cursor: pointer;
	&:hover {
		background-color: ${theme.colors.accent_1};
	}
	input[type='checkbox'] {
		accent-color: #3a8736;
	}
`;

const checkboxLabelStyle = (theme: Theme) => css`
	${theme.typography.body};
	font-size: 13px;
	color: ${theme.colors.accent_dark};
	cursor: pointer;
	user-select: none;
`;

const ColumnVisibilityDropdown = ({ columnHeaders, columnVisibility, onToggle }: ColumnVisibilityDropdownProps) => {
	const theme = useThemeContext();
	const { Columns } = theme.icons;

	return (
		<Dropdown leftIcon={<Columns />} title="Columns" closeOnSelect={false}>
			{columnHeaders.map((header) => (
				<label key={header} css={checkboxRowStyle(theme)}>
					<input type="checkbox" checked={columnVisibility[header] ?? true} onChange={() => onToggle(header)} />
					<span css={checkboxLabelStyle(theme)}>{header}</span>
				</label>
			))}
		</Dropdown>
	);
};

export default ColumnVisibilityDropdown;

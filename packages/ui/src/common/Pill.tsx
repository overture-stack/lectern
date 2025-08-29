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

import { css, SerializedStyles } from '@emotion/react';
import { type ReactNode } from 'react';

import { type Theme } from '../theme/index';
import { useThemeContext } from '../theme/index';

export type PillVariant = 'default';
export type PillSize = 'extra-small' | 'small' | 'medium' | 'large';
export interface PillProps {
	children: ReactNode;
	variant?: PillVariant;
	size?: PillSize;
	icon?: ReactNode;
	customStyles?: SerializedStyles;
}

const baseStyles = css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease-in-out;
	user-select: none;
	text-align: center;
	word-wrap: break-word;
	overflow-wrap: break-word;
	hyphens: auto;
`;

const getSizeStyles = (theme: Theme) => ({
	'extra-small': css`
		padding: 1px 6px;
		${theme.typography.captionBold}
		line-height: 12px;
		border-radius: 3px;
		gap: 3px;
		width: 65px;
		max-width: 75px;
	`,
	small: css`
		padding: 2px 8px;
		${theme.typography.dataBold}
		line-height: 14px;
		border-radius: 4px;
		gap: 4px;
		width: 80px;
		max-width: 100px;
	`,
	medium: css`
		padding: 4px 12px;
		${theme.typography.bodyBold}
		line-height: 16px;
		border-radius: 5px;
		gap: 6px;
		width: 95px;
		max-width: 140px;
	`,
	large: css`
		padding: 6px 16px;
		${theme.typography.bodyBold}
		line-height: 20px;
		border-radius: 6px;
		gap: 8px;
		width: 150px;
		max-width: 180px;
	`,
});

const getVariantStyles = (theme: Theme) => ({
	default: css`
		background-color: ${theme.colors.background_pill};
		color: ${theme.colors.black};
		border: none;
	`,
});

const getIconStyles = (size: PillSize) => {
	const iconSizes = {
		'extra-small': '6px',
		small: '8px',
		medium: '14px',
		large: '12px',
	};

	return css`
		display: flex;
		align-items: center;
		font-size: ${iconSizes[size]};
		flex-shrink: 0;
	`;
};

const Pill = ({ children, variant = 'default', size = 'medium', icon, customStyles }: PillProps) => {
	const theme: Theme = useThemeContext();

	return (
		<div css={[baseStyles, getSizeStyles(theme)[size], getVariantStyles(theme)[variant], customStyles]}>
			{icon && <span css={getIconStyles(size)}>{icon}</span>}
			<span>{children}</span>
		</div>
	);
};

export default Pill;

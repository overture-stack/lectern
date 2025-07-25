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

export type PillVariant = 'default';
export type PillSize = 'extra-small' | 'small' | 'medium' | 'large';
export interface PillProps {
	children: ReactNode;
	variant?: PillVariant;
	size?: PillSize;
	icon?: ReactNode;
	style?: CSSProperties;
}

const getVariantStyles = (variant: PillVariant, theme: Theme) => {
	const VARIANT_STYLES = {
		default: {
			background: theme.colors.background_pill,
			color: theme.colors.black,
			border: 'none',
			hoverBackground: theme.colors.background_pill_hover,
		},
	};
	return VARIANT_STYLES[variant];
};

const getSizeStyles = (size: PillSize) => {
	const sizeStyles = {
		'extra-small': {
			padding: '1px 6px',
			fontSize: '8px',
			fontWeight: '700',
			lineHeight: '12px',
			borderRadius: '3px',
			gap: '3px',
			width: '65px',
			maxWidth: '75px',
		},
		small: {
			padding: '2px 8px',
			fontSize: '10px',
			fontWeight: '700',
			lineHeight: '14px',
			borderRadius: '4px',
			gap: '4px',
			width: '80px',
			maxWidth: '100px',
		},
		medium: {
			padding: '4px 12px',
			fontSize: '16px',
			fontWeight: '700',
			lineHeight: '16px',
			borderRadius: '5px',
			gap: '6px',
			width: '95px',
			maxWidth: '140px',
		},
		large: {
			padding: '6px 16px',
			fontSize: '14px',
			fontWeight: '700',
			lineHeight: '20px',
			borderRadius: '6px',
			gap: '8px',
			width: '150px',
			maxWidth: '180px',
		},
	};

	return sizeStyles[size];
};

const pillStyles = (sizeStyles, variantStyles, icon) => css`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: ${sizeStyles.gap};
	padding: ${sizeStyles.padding};
	font-size: ${sizeStyles.fontSize};
	line-height: ${sizeStyles.lineHeight};
	font-weight: ${sizeStyles.fontWeight};
	border-radius: ${sizeStyles.borderRadius};
	background-color: ${variantStyles.background};
	color: ${variantStyles.color};
	border: ${variantStyles.border};
	transition: all 0.2s ease-in-out;
	user-select: none;
	width: ${sizeStyles.width};
	max-width: ${sizeStyles.maxWidth};
	text-align: center;
	word-wrap: break-word;
	overflow-wrap: break-word;
	hyphens: auto;
	${icon ?
		css`
			.pill-icon {
				display: flex;
				align-items: center;
				font-size: ${parseInt(sizeStyles.fontSize) - 2}px;
				flex-shrink: 0;
			}
		`
	:	''};
`;

const Pill = ({ children, variant = 'default', size = 'medium', icon, style }: PillProps) => {
	const theme: Theme = useThemeContext();
	const variantStyles = getVariantStyles(variant, theme);
	const sizeStyles = getSizeStyles(size);

	return (
		<div css={pillStyles(sizeStyles, variantStyles, icon)} style={style}>
			{icon && <span className="pill-icon">{icon}</span>}
			<span style={{ textAlign: 'center' }}>{children}</span>
		</div>
	);
};

export default Pill;

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Theme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
export type PillVariant = 'default' | 'button';
export type PillSize = 'extra-small' | 'small' | 'medium' | 'large';

export interface PillProps {
	children: ReactNode;
	variant?: PillVariant;
	size?: PillSize;
	icon?: ReactNode;
	onClick?: (event: MouseEvent<HTMLDivElement>) => void;
	style?: CSSProperties;
}

const getVariantStyles = (variant: PillVariant, theme: Theme) => {
	const VARIANT_STYLES = {
		default: {
			background: '#E5E7EA',
			color: theme.colors.black,
			border: 'none',
			hoverBackground: '#D8DADD',
		},
		button: {
			background: '#FFFF',
			color: theme.colors.black,
			border: `1px solid ${theme.colors.black}`,
			hoverBackground: '#F5F5F5',
		},
	};
	return VARIANT_STYLES[variant];
};

const getSizeStyles = (size: PillSize, theme: Theme) => {
	const sizeStyles = {
		'extra-small': {
			padding: '1px 6px',
			font: { ...theme.typography.captionBold },
			borderRadius: '3px',
			gap: '3px',
			width: '65px',
			maxWidth: '75px',
		},
		small: {
			padding: '2px 8px',
			font: { ...theme.typography.captionBold },
			borderRadius: '4px',
			gap: '4px',
			width: '80px',
			maxWidth: '100px',
		},
		medium: {
			padding: '4px 12px',
			font: { ...theme.typography.paragraphSmallBold },
			borderRadius: '5px',
			gap: '6px',
			width: '95px',
			maxWidth: '140px',
		},
		large: {
			padding: '6px 16px',
			font: { ...theme.typography.dataBold },
			borderRadius: '6px',
			gap: '8px',
			width: '150px',
			maxWidth: '180px',
		},
	};

	return sizeStyles[size];
};

const Pill = ({ children, variant = 'default', size = 'medium', icon, onClick, style }: PillProps) => {
	const theme = useThemeContext();
	const variantStyles = getVariantStyles(variant, theme);
	const sizeStyles = getSizeStyles(size, theme);

	const pillStyles = css`
		${sizeStyles.font}
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: ${sizeStyles.gap};
		padding: ${sizeStyles.padding};
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
		${onClick ?
			css`
				cursor: pointer;
				&:hover {
					background-color: ${variantStyles.hoverBackground};
				}
			`
		:	''}
		${icon ?
			css`
				.pill-icon {
					display: flex;
					align-items: center;
					flex-shrink: 0;
				}
			`
		:	''};
	`;

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (onClick) {
			event.stopPropagation;
			onClick(event);
		}
	};

	return (
		<div
			css={pillStyles}
			style={style}
			onClick={handleClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{icon && <span className="pill-icon">{icon}</span>}
			<span style={{ textAlign: 'center' }}>{children}</span>
		</div>
	);
};

export default Pill;

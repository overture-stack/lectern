/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { CSSProperties, MouseEvent, ReactNode } from 'react';
import colors from '../theme/styles/colors';

export type PillVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type PillSize = 'small' | 'medium' | 'large';

export interface PillProps {
	children: ReactNode;
	variant?: PillVariant;
	size?: PillSize;
	icon?: ReactNode;
	onClick?: (event: MouseEvent<HTMLDivElement>) => void;
	dark?: boolean;
	style?: CSSProperties;
}

const getVariantStyles = (dark: boolean) => {
	return {
		background: dark ? '#D9D9D9' : '#E5E7EA',
		color: dark ? colors.black : colors.black,
	};
};

const getSizeStyles = (size: PillSize) => {
	const sizeStyles = {
		small: {
			padding: '2px 8px',
			fontSize: '10px',
			lineHeight: '14px',
			borderRadius: '12px',
			gap: '4px',
		},
		medium: {
			padding: '4px 12px',
			fontSize: '12px',
			lineHeight: '16px',
			borderRadius: '16px',
			gap: '6px',
		},
		large: {
			padding: '6px 16px',
			fontSize: '14px',
			lineHeight: '20px',
			borderRadius: '20px',
			gap: '8px',
		},
	};

	return sizeStyles[size];
};

const Pill = ({ children, variant = 'default', size = 'medium', icon, onClick, dark = false, style }: PillProps) => {
	const variantStyles = getVariantStyles(dark);
	const sizeStyles = getSizeStyles(size);

	const pillStyles = css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: ${sizeStyles.gap}px;
		padding: ${sizeStyles.padding};
		font-size: ${sizeStyles.fontSize};
		line-height: ${sizeStyles.lineHeight};
		font-weight: 500;
		border-radius: ${sizeStyles.borderRadius};
		background-color: ${variantStyles.background};
		color: ${variantStyles.color};
		transition: all 0.2s ease-in-out;
		user-select: none;
		white-space: nowrap;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;

		${onClick ?
			css`
				cursor: pointer;
				&:hover {
					transform: translateY(-1px);
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}
				&:active {
					transform: translateY(0);
					box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
				}
			`
		:	''}

		${icon ?
			css`
				.pill-icon {
					display: flex;
					align-items: center;
					font-size: ${parseInt(sizeStyles.fontSize) - 2}px;
				}
			`
		:	''}
	`;

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (onClick) {
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
			<span>{children}</span>
		</div>
	);
};

export default Pill;

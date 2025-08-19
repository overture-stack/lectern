/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import type { Theme } from '../theme';
import LoadingSpinnerIcon from '../theme/icons/LoadingSpinnerIcon';
import { useThemeContext } from '../theme/ThemeContext';

const containerStyles = css`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
`;

const contentStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 24px;
`;

const loadingTextStyles = (theme: Theme) => css`
	${theme.typography.bodyBold}
	color: ${theme.colors.accent};
	margin: 0;
`;

const LoadingPage = () => {
	const theme: Theme = useThemeContext();

	return (
		<div css={containerStyles}>
			<div css={contentStyles}>
				<LoadingSpinnerIcon size={100} />
				<p css={loadingTextStyles(theme)}>Loading...</p>
			</div>
		</div>
	);
};

export default LoadingPage;

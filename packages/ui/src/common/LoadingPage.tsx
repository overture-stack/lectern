/** @jsxImportSource @emotion/react */

import { css, keyframes } from '@emotion/react';
import React from 'react';

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

const LoadingPage = () => {
	return (
		<div
			css={css`
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
			`}
		>
			<div
				css={css`
					width: 100px;
					height: 100px;
					border: 13px solid;
					border-image-source: linear-gradient(224.93deg, #f5f7f8 7.44%, #e5edf3 64.74%);
					border-image-slice: 1;
					border-radius: 999px;
					animation: ${spin} 1.4s linear infinite;
				`}
			/>
		</div>
	);
};

export default LoadingPage;

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import Modal, { Styles } from 'react-modal';

import { Theme } from '../theme';
import Cancel from '../theme/icons/Cancel';
import { useThemeContext } from '../theme/ThemeContext';
import Button from './Button';

export type ModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	onAfterOpen?: () => void;
	children?: React.ReactNode;
	title: string;
};

// the documentation for react-modal suggests the styling to be done via a Styles object
const customStyles = (theme: Theme): Styles => ({
	content: {
		alignItems: 'center',
		position: 'relative',
		justifyContent: 'center',
		borderRadius: '8px',
		boxShadow: `0 2px 6px rgba(70, 63, 63, 0.05), 0 0 0 0.3px ${theme.colors.black}`,
		transition: 'all 0.3s ease',
		minHeight: '400px',
		maxWidth: '1000px',
		overflowX: 'hidden',
		overflowY: 'visible',
	},
	overlay: { backgroundColor: 'rgba(0, 28, 61, 0.8)' },
});

const titleContainerStyle = (theme: Theme) => css`
	display: flex;
	align-items: center;
	flex-direction: row;
`;
const ModalComponent = ({ children, setIsOpen, isOpen, onAfterOpen, title }: ModalProps) => {
	const theme = useThemeContext();
	return (
		<Modal
			isOpen={isOpen}
			onAfterOpen={onAfterOpen}
			onRequestClose={() => setIsOpen(false)}
			style={customStyles(theme)}
			contentLabel="Example Modal"
		>
			<div css={titleContainerStyle(theme)}>
				{title}
				<Button iconOnly={true} onClick={() => setIsOpen(false)} icon={<Cancel />} />
			</div>
			{children}
		</Modal>
	);
};
export default ModalComponent;

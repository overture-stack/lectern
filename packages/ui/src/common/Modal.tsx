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

const customStyles = (theme: Theme): Styles => ({
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		transform: 'translate(-50%, -50%)',
		width: '90%',
		maxWidth: '1000px',
		maxHeight: '40vh',
		padding: 0,
		overflow: 'hidden',
		borderRadius: '8px',
		boxShadow: `0 2px 6px rgba(70,63,63,0.05), 0 0 0 0.3px ${theme.colors.black}`,
		transition: 'all 0.3s ease',
	},
	overlay: {
		backgroundColor: 'rgba(0,28,61,0.8)',
		zIndex: 1000,
	},
});

const headerStyle = (theme: Theme) => css`
	${theme.typography.heading}
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid #d3d3d3;
	background: ${theme.colors.white};
`;

const bodyStyle = css`
	padding: 16px;
	overflow-y: auto;
	height: calc(40vh - 56px);
`;

const ModalComponent = ({ children, setIsOpen, isOpen, onAfterOpen, title }: ModalProps) => {
	const theme = useThemeContext();

	return (
		<Modal
			isOpen={isOpen}
			onAfterOpen={onAfterOpen}
			onRequestClose={() => setIsOpen(false)}
			style={customStyles(theme)}
			contentLabel={title}
		>
			<div css={headerStyle(theme)}>
				<span>{title}</span>
				<Button iconOnly onClick={() => setIsOpen(false)} icon={<Cancel />} />
			</div>
			<div css={bodyStyle}>{children}</div>
		</Modal>
	);
};

export default ModalComponent;

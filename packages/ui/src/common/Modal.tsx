import Modal, { Styles } from 'react-modal';
import theme, { Theme } from '../theme';
import { css } from '@emotion/react';
import Button from './Button';
import { useThemeContext } from '../theme/ThemeContext';

export type ModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	onAfterOpen?: () => void;
	children?: React.ReactNode;
};

const customStyles = (theme: Theme): Styles => ({
	content: {
		borderRadius: '8px',
		boxShadow: `0 2px 6px rgba(70, 63, 63, 0.05), 0 0 0 0.3px ${theme.colors.black}`,
		transition: 'all 0.3s ease',
	},
	overlay: { backgroundColor: 'rgba(0, 28, 61, 0.8)' },
});

const ModalComponent = ({ children, setIsOpen, isOpen, onAfterOpen }: ModalProps) => {
	const theme = useThemeContext();
	return (
		<Modal
			isOpen={isOpen}
			onAfterOpen={onAfterOpen}
			onRequestClose={() => setIsOpen(false)}
			style={customStyles(theme)}
			contentLabel="Example Modal"
		>
			<Button onClick={() => setIsOpen(false)}>close</Button>
			{children}
		</Modal>
	);
};
export default ModalComponent;

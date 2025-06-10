import { useEffect } from 'react';
import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

export interface ExpandAllButtonProps {
	onClick: () => void;
}

const ExpandAllButton = ({ onClick }: ExpandAllButtonProps) => {
	const theme = useThemeContext();
	const { Eye } = theme.icons;

	return (
		<Button leftIcon={<Eye />} onClick={onClick}>
			Expand All
		</Button>
	);
};

export default ExpandAllButton;

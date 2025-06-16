import { useEffect } from 'react';
import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

export interface CollapseAllButtonProps {
	onClick: () => void;
}

const CollapseAllButton = ({ onClick }: CollapseAllButtonProps) => {
	const theme = useThemeContext();
	const { Collapse } = theme.icons;

	return (
		<Button leftIcon={<Collapse />} onClick={onClick}>
			Collapse All
		</Button>
	);
};

export default CollapseAllButton;

import { useEffect } from 'react';
import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

export interface ExpandAllButtonProps {
	setIsCollapsed: (isCollapsed: boolean) => void;
	expandOnLoad?: boolean; // This prop is optional and defaults to false
}

const ExpandAllButton = ({ setIsCollapsed, expandOnLoad = false }: ExpandAllButtonProps) => {
	const theme = useThemeContext();
	const { Eye } = theme.icons;

	useEffect(() => {
		setIsCollapsed(expandOnLoad);
	}, [expandOnLoad, setIsCollapsed]);

	return (
		<Button leftIcon={<Eye />} onClick={() => setIsCollapsed(false)}>
			Expand All
		</Button>
	);
};

export default ExpandAllButton;

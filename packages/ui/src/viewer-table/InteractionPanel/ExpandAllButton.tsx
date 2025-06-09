import { useEffect } from 'react';
import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

interface ExpandAllButtonProps {
	setIsCollapsed: (isCollapsed: boolean) => void;
	expandOnLoad?: boolean; // This prop is optional and defaults to false
	disabled?: boolean;
}

const ExpandAllButton = ({ setIsCollapsed, expandOnLoad = false, disabled = false }: ExpandAllButtonProps) => {
	const theme = useThemeContext();
	const { Eye } = theme.icons;

	useEffect(() => {
		setIsCollapsed(expandOnLoad);
	}, [expandOnLoad, setIsCollapsed]);

	return (
		<Button leftIcon={<Eye />} onClick={() => setIsCollapsed(false)} disabled={disabled}>
			Expand All
		</Button>
	);
};

export default ExpandAllButton;

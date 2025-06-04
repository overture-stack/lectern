import { useEffect } from 'react';
import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

interface CollapseAllButtonProps {
	setIsCollapsed: (isCollapsed: boolean) => void;
	collapsedOnLoad?: boolean; // This prop is optional and defaults to false
}

const CollapseAllButton = ({ setIsCollapsed, collapsedOnLoad = false }: CollapseAllButtonProps) => {
	const theme = useThemeContext();
	const { Collapse } = theme.icons;

	useEffect(() => {
		setIsCollapsed(collapsedOnLoad);
	}, [collapsedOnLoad, setIsCollapsed]);

	return (
		<Button leftIcon={<Collapse />} onClick={() => setIsCollapsed(true)}>
			Collapse All
		</Button>
	);
};

export default CollapseAllButton;

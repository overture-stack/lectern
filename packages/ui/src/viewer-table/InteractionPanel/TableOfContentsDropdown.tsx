import type { Schema } from '@overture-stack/lectern-dictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import { useThemeContext } from '../../theme/ThemeContext';

type TableOfContentsDropdownProps = {
	schemas: Schema[];
	onAccordionToggle: (schemaName: string, isOpen: boolean) => void;
	disabled?: boolean;
};

const TableOfContentsDropdown = ({ schemas, onAccordionToggle, disabled = false }: TableOfContentsDropdownProps) => {
	const theme = useThemeContext();
	const { List } = theme.icons;
	const handleAction = (schema: Schema) => {
		const anchorId = `${schema.name}`;
		onAccordionToggle(schema.name, true); // Ensuring that the accordion for the associated schema is open, via the state handler that will be defined in parent component
		setTimeout(() => {
			window.location.hash = anchorId;
		}, 100);
	};

	const menuItemsFromSchemas = schemas.map((schema) => ({
		label: schema.name,
		action: () => {
			handleAction(schema);
		},
	}));

	return (
		<Dropdown leftIcon={<List />} title="Table of Contents" menuItems={menuItemsFromSchemas} disabled={disabled} />
	);
};

export default TableOfContentsDropdown;

import type { Schema } from '@overture-stack/lectern-dictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import List from '../../theme/icons/List';

type TableOfContentsDropdownProps = {
	schemas: Schema[];
	onSchemaSelect: (schema: Schema) => void;
	onAccordionToggle: (schemaName: string, isOpen: boolean) => void;
};

const TableOfContentsDropdown = ({ schemas, onSchemaSelect, onAccordionToggle }: TableOfContentsDropdownProps) => {
	const handleAction = (schema: Schema) => {
		const anchorId = `${schema.name}`;
		onAccordionToggle(schema.name, true);
		onSchemaSelect(schema);
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

	return <Dropdown leftIcon={<List />} title="Table of Contents" menuItems={menuItemsFromSchemas} />;
};

export default TableOfContentsDropdown;

import type { Schema } from '@overture-stack/lectern-dictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import List from '../../theme/icons/List';

type TableOfContentsDropdownProps = {
	schemas: Schema[];
};

const TableOfContentsDropdown = ({ schemas }: TableOfContentsDropdownProps) => {
	const generateOptionsFromSchemas = () => {
		return schemas.map((schema) => ({
			label: schema.name,
			action: () => {
				console.log(`Selected schema: ${schema.name}`);
			},
		}));
	};
	return <Dropdown leftIcon={<List />} title="Table of Contents" menuItems={generateOptionsFromSchemas()} />;
};

export default TableOfContentsDropdown;

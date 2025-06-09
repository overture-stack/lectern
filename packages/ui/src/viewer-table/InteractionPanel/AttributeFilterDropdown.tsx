import type { Dictionary } from '@overture-stack/lectern-dictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import ListFilter from '../../theme/icons/ListFilter';

type FilterDropdownProps = {
	data: Dictionary;
	isFiltered: boolean;
	setFilteredData: (dict: Dictionary) => void;
	setIsFiltered: (bool: boolean) => void;
	disabled?: boolean;
};

const AttributeFilter = ({
	data,
	isFiltered,
	setFilteredData,
	setIsFiltered,
	disabled = false,
}: FilterDropdownProps) => {
	const handleFilterSelect = (selectedFilterName: string) => {
		if (isFiltered) {
			setFilteredData(data);
			setIsFiltered(false);
			return;
		}

		if (selectedFilterName === 'Required') {
			const filteredDictionary: Dictionary = {
				...data,
				schemas: data.schemas.map((schema) => ({
					...schema,
					fields: schema.fields.filter((field: any) => field?.restrictions?.required === true),
				})),
			};
			setFilteredData(filteredDictionary);
		}
		// Add more filters here as needed
		// Follow the same pattern as above for additional filters
		// If we have a lot of filtering logic, we might want to consider moving this logic into a separate utility function
		else {
			setFilteredData(data);
		}

		setIsFiltered(true);
	};

	// We can easily define more filters here in the future
	const menuItems = [
		{
			label: 'All Fields',
			action: () => handleFilterSelect('All Fields'),
		},
		{
			label: 'Required Only',
			action: () => handleFilterSelect('Required'),
		},
	];

	return <Dropdown leftIcon={<ListFilter />} title="Filter By" menuItems={menuItems} disabled={disabled} />;
};

export default AttributeFilter;

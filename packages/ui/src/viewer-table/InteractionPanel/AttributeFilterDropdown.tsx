import Dropdown from '../../common/Dropdown/Dropdown';

export type FilterDropdownProps = {
	filters: FilterOptions[];
	setFilters: (filters: FilterOptions[]) => void;
};

export type FilterOptions = 'Required' | 'All Fields';

const FilterDropdown = ({ filters, setFilters }: FilterDropdownProps) => {
	const handleFilterSelect = (selectedFilterName: FilterOptions) => {
		// If we click the filter again then we want to toggle it off, iff it is the same filter being clicked
		// and it is currently active
		if (filters?.includes(selectedFilterName)) {
			setFilters([]);
			return;
		}
		setFilters([selectedFilterName]);
	};
	const menuItems = [
		{
			label: 'Required Only',
			action: () => handleFilterSelect('Required'),
		},
		{
			label: 'All Fields',
			action: () => handleFilterSelect('All Fields'),
		},
	];

	return <Dropdown title="Filter By" menuItems={menuItems} />;
};

export default FilterDropdown;

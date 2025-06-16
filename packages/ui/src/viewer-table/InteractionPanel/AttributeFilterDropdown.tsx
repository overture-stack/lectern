import Dropdown from '../../common/Dropdown/Dropdown';

export type FilterDropdownProps = {
	filters: FilterMapping;
	setFilters: (filters: FilterMapping) => void;
	disabled?: boolean;
};

export type FilterMapping = {
	constraints?: FilterOptions[];
	active: boolean;
};

export type FilterOptions = 'Required' | 'All Fields';

const AttributeFilter = ({ filters, setFilters, disabled }: FilterDropdownProps) => {
	const handleFilterSelect = (selectedFilterName: FilterOptions) => {
		// If we click the filter again then we want to toggle it off, iff it is the same filter being clicked
		// and it is currently active
		if (filters.active && filters.constraints?.includes(selectedFilterName)) {
			setFilters({ active: false, constraints: [] });
			return;
		}
		setFilters({ active: true, constraints: [selectedFilterName] });
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

	return <Dropdown title="Filter By" menuItems={menuItems} disabled={disabled} />;
};

export default AttributeFilter;

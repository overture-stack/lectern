/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

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

/*
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
 */

import React from 'react';

import Dropdown from '../../common/Dropdown/Dropdown';

export type AttributeFilterDropdownProps = {
	filters: FilterOptions[];
	setFilters: (filters: FilterOptions[]) => void;
	disabled?: boolean;
};

export type FilterOptions = 'Required' | 'All Fields';

const AttributeFilterDropdown = ({ filters, setFilters, disabled }: AttributeFilterDropdownProps) => {
	const handleFilterSelect = (selectedFilterName: FilterOptions) => {
		// Toggles selected filter on click
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

	return <Dropdown title="Filter By" menuItems={menuItems} disabled={disabled} />;
};

export default AttributeFilterDropdown;

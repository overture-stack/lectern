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

import type { Schema } from '@overture-stack/lectern-dictionary';
import React from 'react';

import Dropdown from '../../common/Dropdown/Dropdown';
import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

export type TableOfContentsDropdownProps = {
	schemas: Schema[];
	onSelect: (schemaIndex: number) => void;
	disabled?: boolean;
};

const TableOfContentsDropdown = ({ schemas, onSelect, disabled }: TableOfContentsDropdownProps) => {
	const theme: Theme = useThemeContext();
	const { List } = theme.icons;
	const handleAction = (index: number) => {
		const anchorId = `#${index}`;
		onSelect(index);
		window.location.hash = anchorId;
	};

	const menuItemsFromSchemas = schemas.map((schema, index) => ({
		label: schema.name,
		action: () => {
			handleAction(index);
		},
	}));

	return schemas.length > 0 ?
			<Dropdown leftIcon={<List />} title="Table of Contents" menuItems={menuItemsFromSchemas} disabled={disabled} />
		:	null;
};

export default TableOfContentsDropdown;

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

/** @jsxImportSource @emotion/react */
import { Dictionary } from '@overture-stack/lectern-dictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import { useThemeContext } from '../../theme/ThemeContext';
import { FilterOptions } from './AttributeFilterDropdown';

type VersionSwitcherProps = {
	config: DictionaryConfig;
	disabled?: boolean;
};
export type DictionaryConfig = {
	lecternUrl: string;
	dictionaryIndex: number;
	dictionaryData: Dictionary[];
	onVersionChange: (index: number) => void;
	filters: FilterOptions[];
	setFilters: (filters: FilterOptions[]) => void;
};

const VersionSwitcher = ({ config, disabled = false }: VersionSwitcherProps) => {
	const theme = useThemeContext();
	const { History } = theme.icons;

	const versionSwitcherObjectArray = config.dictionaryData?.map((dictionary: Dictionary, index: number) => {
		// TODO: We should either remove the version date stamp requirement or update the date to be dynamic via
		// lectern-client
		return {
			label: 'Version ' + dictionary?.version,
			action: () => {
				config.onVersionChange(index);
			},
		};
	});

	// If there is only one version, we don't need to show the dropdown as per specifications
	const displayVersionSwitcher = versionSwitcherObjectArray && versionSwitcherObjectArray.length > 1;

	return (
		displayVersionSwitcher && (
			<Dropdown
				leftIcon={<History />}
				menuItems={versionSwitcherObjectArray}
				title={`Version ${config.dictionaryData?.[config.dictionaryIndex].version}`}
				disabled={disabled}
			/>
		)
	);
};

export default VersionSwitcher;

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
 *
 */

import Dropdown from '../../common/Dropdown/Dropdown';
import { useDictionaryDataContext } from '../../dictionary-controller/DictionaryDataContext';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

const formatDate = (dateString: string | undefined): string => {
	return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
};
const DictionaryVersionSwitcher = () => {
	const theme: Theme = useThemeContext();
	const { History } = theme.icons;
	const { loading, error, dictionaries, currentDictionaryIndex, setCurrentDictionaryIndex } =
		useDictionaryDataContext();
	const selectedDictionary = dictionaries?.[currentDictionaryIndex];

	const createdAt = selectedDictionary && 'createdAt' in selectedDictionary ? selectedDictionary.createdAt : '';

	const formattedCreatedAt = formatDate(createdAt?.toString());
	const title =
		selectedDictionary?.version ? `Version ${selectedDictionary.version} (${formattedCreatedAt})` : 'Select Version';

	const versionSwitcherObjectArray = dictionaries?.map((item: any, index: number) => {
		const itemCreatedAt = 'createdAt' in item ? item.createdAt : '';
		const itemFormattedDate = formatDate(itemCreatedAt);
		const displayVersionDate = itemFormattedDate ? `(${itemFormattedDate})` : '';
		return {
			label: `Version ${item?.version} ${displayVersionDate}`,
			action: () => {
				setCurrentDictionaryIndex(index);
			},
		};
	});

	const displayVersionSwitcher = versionSwitcherObjectArray && versionSwitcherObjectArray.length > 1;

	return (
		displayVersionSwitcher && (
			<Dropdown
				leftIcon={<History />}
				menuItems={versionSwitcherObjectArray}
				title={title}
				disabled={loading || error}
			/>
		)
	);
};

export default DictionaryVersionSwitcher;

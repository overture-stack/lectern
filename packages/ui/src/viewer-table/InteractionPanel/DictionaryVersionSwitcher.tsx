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
import { DictionaryServerRecord } from '../../../../client/src/rest/getDictionary';
import Dropdown from '../../common/Dropdown/Dropdown';
import { useThemeContext } from '../../theme/ThemeContext';

export type DictionaryServerUnion = Dictionary | DictionaryServerRecord;

export type DictionaryVersionSwitcherProps = {
	dictionaryData: DictionaryServerUnion[];
	dictionaryIndex: number;
	onVersionChange: (index: number) => void;
	disabled?: boolean;
	title: string;
};

const DictionaryVersionSwitcher = ({
	dictionaryData,
	dictionaryIndex,
	onVersionChange,
	disabled = false,
	title,
}: DictionaryVersionSwitcherProps) => {
	const theme = useThemeContext();

	const { History } = theme.icons;

	const versionSwitcherObjectArray = dictionaryData?.map((dictionary: DictionaryServerUnion, index: number) => {
		const displayVersionDate =
			'createdAt' in dictionaryData?.[dictionaryIndex] ? `(${dictionaryData?.[dictionaryIndex].createdAt})` : '';
		return {
			label: `Version ${dictionary?.version} ${displayVersionDate}`,
			action: () => {
				onVersionChange(index);
			},
		};
	});

	// If there is only one version, we don't need to show the dropdown as per specifications
	const displayVersionSwitcher = versionSwitcherObjectArray && versionSwitcherObjectArray.length > 1;

	return (
		displayVersionSwitcher && (
			<Dropdown leftIcon={<History />} menuItems={versionSwitcherObjectArray} title={title} disabled={disabled} />
		)
	);
};

export default DictionaryVersionSwitcher;

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

import { useState } from 'react';

import Button from '../../common/Button';
import { useThemeContext } from '../../theme/ThemeContext';

export type DictionaryDownloadButtonProps = {
	version: string;
	name: string;
	lecternUrl: string;
	fileType: 'tsv' | 'csv';
	disabled?: boolean;
};

const DictionaryDownloadButton = ({
	version,
	name,
	lecternUrl,
	fileType = 'tsv',
	disabled = false,
}: DictionaryDownloadButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const theme = useThemeContext();
	const { FileDownload } = theme.icons;

	const fetchUrl = `${lecternUrl}/dictionaries/template/download?${new URLSearchParams({
		name,
		version,
		fileType,
	})}`;

	const downloadDictionary = async () => {
		try {
			setIsLoading(true);
			const res = await fetch(fetchUrl);

			if (!res.ok) {
				throw new Error(`Failed with status ${res.status}`);
			}

			//Triggers a file download in the browser by creating a temporary link to a Blob
			// and simulating a click.

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = `${name}_${version}_templates.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading dictionary:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button leftIcon={<FileDownload />} onClick={downloadDictionary} disabled={disabled || isLoading}>
			Submission Templates
		</Button>
	);
};

export default DictionaryDownloadButton;

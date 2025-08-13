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

import { css } from '@emotion/react';
import Button from '../../common/Button';
import { useDictionaryDataContext } from '../../dictionary-controller/DictionaryDataContext';
import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

export type DictionaryDownloadButtonProps = {
	fileType: 'tsv' | 'csv';
	iconOnly?: boolean;
	schemaName?: string;
};

const downloadDictionary = async ({ fetchUrl, name, version, schemaName }): Promise<void> => {
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
	const fileName = schemaName ? `${name}_${version}_${schemaName}_template.zip` : `${name}_${version}_templates.zip`;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	URL.revokeObjectURL(url);
};

/**
 * A Button that downloads submission templates.
 * If a schemaName is provided, it treats the download as an individual schema download
 * @param {DictionaryDownloadButtonProps} props
 */

export const DictionaryDownloadButton = ({ fileType, iconOnly = false, schemaName }: DictionaryDownloadButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const theme: Theme = useThemeContext();
	const { FileDownload } = theme.icons;

	const { loading, error, dictionaries, currentDictionaryIndex, lecternUrl } = useDictionaryDataContext();

	const selectedDictionary = dictionaries?.[currentDictionaryIndex];

	if (!selectedDictionary || !lecternUrl || !selectedDictionary.name || !selectedDictionary.version) {
		return null;
	}

	const { name, version } = selectedDictionary;

	const queryParams = new URLSearchParams({
		name,
		version,
		fileType,
	});

	if (schemaName !== undefined && !schemaName.trim()) {
		queryParams.append('schemaName', schemaName);
	}

	const fetchUrl = `${lecternUrl}/dictionaries/template/download?${queryParams}`;

	return (
		<Button
			iconOnly={iconOnly}
			styleOverride={
				iconOnly ?
					css`
						padding: 8px;
					`
				:	undefined
			}
			icon={<FileDownload />}
			onClick={async (e) => {
				e.stopPropagation();
				setIsLoading(true);
				try {
					await downloadDictionary({ fetchUrl, name, version, schemaName });
				} catch (error) {
					console.error('Error downloading dictionary:', error);
				} finally {
					setIsLoading(false);
				}
			}}
			disabled={loading || error || isLoading}
		>
			Submission Templates
		</Button>
	);
};

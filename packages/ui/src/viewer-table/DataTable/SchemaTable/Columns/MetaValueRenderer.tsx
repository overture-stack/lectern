/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { css } from '@emotion/react';

import ReadMoreText from '../../../../common/ReadMoreText';
import { type Theme, useThemeContext } from '../../../../theme/index';

const URL_REGEX = /^https?:\/\/\S+$/;

const isUrl = (value: string): boolean => URL_REGEX.test(value);

const linkStyle = (theme: Theme) => css`
	color: ${theme.colors.secondary};
	text-decoration: none;
	&:hover {
		text-decoration: underline;
	}
`;

const commaListStyle = css`
	display: inline;
	list-style: none;
	margin: 0;
	padding: 0;

	& > li {
		display: inline;
	}

	& > li + li::before {
		content: ', ';
	}
`;

const objectBlockStyle = css`
	margin: 0;
	padding: 0;
`;

const nestedObjectStyle = css`
	padding-left: 12px;
`;

const objectEntryStyle = css`
	margin: 0;
`;

const inheritTypographyStyle = css`
	font-size: inherit;
	font-weight: inherit;
	line-height: inherit;
`;

export type MetaValueRendererProps = {
	value: unknown;
};

const isPlainValue = (value: unknown): boolean =>
	value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const renderValue = (value: unknown, theme: Theme): React.ReactNode => {
	if (value == null) {
		return null;
	}

	if (typeof value === 'string') {
		if (isUrl(value)) {
			return (
				<a href={value} target="_blank" rel="noopener noreferrer" css={linkStyle(theme)}>
					{value}
				</a>
			);
		}
		return <label>{value}</label>;
	}

	if (typeof value === 'number' || typeof value === 'boolean') {
		return <label>{String(value)}</label>;
	}

	if (Array.isArray(value)) {
		return (
			<ul css={commaListStyle}>
				{value.map((item, index) => (
					<li key={index}>{renderValue(item, theme)}</li>
				))}
			</ul>
		);
	}

	if (typeof value === 'object') {
		return (
			<div css={objectBlockStyle}>
				{Object.entries(value).map(([key, val]) => (
					<div key={key} css={objectEntryStyle}>
						<strong>{key}:</strong>{' '}
						{isPlainValue(val) || Array.isArray(val) ?
							renderValue(val, theme)
						:	<div css={nestedObjectStyle}>{renderValue(val, theme)}</div>}
					</div>
				))}
			</div>
		);
	}

	return null;
};

const MetaValueRenderer = ({ value }: MetaValueRendererProps) => {
	const theme = useThemeContext();

	if (value == null) {
		return null;
	}

	return (
		<ReadMoreText maxLines={3} wrapperStyle={inheritTypographyStyle}>
			{renderValue(value, theme)}
		</ReadMoreText>
	);
};

export default MetaValueRenderer;

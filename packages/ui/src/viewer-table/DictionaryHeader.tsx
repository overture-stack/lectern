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
import { css } from '@emotion/react';
import type { Dictionary } from '@overture-stack/lectern-dictionary';
import { ComponentType } from 'react';
import { useThemeContext } from '../theme/ThemeContext';

export type DictionaryHeaderProps = Pick<Dictionary, 'name' | 'description' | 'version'>;

export const DictionaryHeader: ComponentType<DictionaryHeaderProps> = ({ description, name, version }) => {
	const theme = useThemeContext();

	return (
		<div
			css={css({
				backgroundColor: theme.colors.accent_dark,
				display: 'flex',
				flexDirection: 'column',
				marginBottom: '1rem',
				padding: '2.5rem',
				maxHeight: '10%',
				alignItems: 'flex-start',
			})}
		>
			<div
				css={css`
					display: flex;
					flex-direction: column;
				`}
			>
				<h2
					css={css`
						${theme.typography.heading}
						font-weight: 700;
						font-size: 40px;
						color: white;
						line-height: 100%;
						margin: 0.5rem 0;
					`}
				>
					{name}
				</h2>
				<span
					css={css`
						${theme.typography.subheading}
						color: white;
						margin: 0;
					`}
				>
					Version: {version}
				</span>
				<p
					css={css`
						${theme.typography.subheading}
						color: white;
						margin: 0;
					`}
				>
					{description}
				</p>
			</div>
		</div>
	);
};

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

import type { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import { HeaderSkeleton } from '../Loading/HeaderSkeleton';
import { InteractionPanelSkeleton } from '../Loading/InteractionPanelSkeleton';
import LoadingSpinner from '../Loading/LoadingSpinner';

const pageContainerStyle = (theme: Theme) => css`
	margin: 0 auto;
	min-height: calc(100vh - ${theme.dimensions.navbar.height}px - ${theme.dimensions.footer.height}px);
	padding: 0 16px 40px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const headerPanelBlockStyle = css`
	display: flex;
	flex-direction: column;
	gap: 0;
`;

const loadingContentStyles = css`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
`;

const DictionaryViewerLoadingPage = () => {
	const theme: Theme = useThemeContext();

	return (
		<div css={pageContainerStyle(theme)}>
			<div css={headerPanelBlockStyle}>
				<HeaderSkeleton />
				<InteractionPanelSkeleton />
			</div>
			<div css={loadingContentStyles}>
				<LoadingSpinner size={69} />
			</div>
		</div>
	);
};

export default DictionaryViewerLoadingPage;

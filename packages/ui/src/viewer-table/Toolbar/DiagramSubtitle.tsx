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
import { useActiveRelationship } from '../EntityRelationshipDiagram';
import { useThemeContext, type Theme } from '../../theme/index';

const pillStyle = (theme: Theme) => css`
	display: inline-block;
	border: 1px solid black;
	border-radius: 12px;
	padding: 2px 10px;
	${theme.typography.data};
	color: black;
`;

const arrowStyle = css`
	margin: 0 6px;
`;

const clearButtonStyle = (theme: Theme) => css`
	background: none;
	border: none;
	cursor: pointer;
	color: black;
	${theme.typography.data};
	text-decoration: underline;
	padding: 0;
	margin-top: 4px;
`;

const chainRowStyle = css`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 2px;
`;

const chainItemStyle = css`
	display: inline-flex;
	align-items: center;
`;

const chainLabelStyle = css`
	font-weight: bold;
	padding-right: 5px;
`;

const DiagramSubtitle = () => {
	const { activeSchemaChain, deactivateRelationship } = useActiveRelationship();
	const theme = useThemeContext();

	if (!activeSchemaChain) {
		return <span>Select any key field or edge to highlight a relation.</span>;
	}

	return (
		<>
			<div css={chainRowStyle}>
				<span css={chainLabelStyle}>Highlighting schema relation:</span>
				{activeSchemaChain.map((schema, index) => (
					<span key={index} css={chainItemStyle}>
						{index > 0 && <span css={arrowStyle}>{'\u2192'}</span>}
						<span css={pillStyle(theme)}>{schema}</span>
					</span>
				))}
			</div>
			<div>
				<button css={clearButtonStyle(theme)} onClick={deactivateRelationship}>
					Clear Highlight
				</button>
			</div>
		</>
	);
};

export default DiagramSubtitle;

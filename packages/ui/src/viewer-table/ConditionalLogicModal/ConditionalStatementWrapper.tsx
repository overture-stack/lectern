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
 */

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { type ReactNode } from 'react';

import { type Theme, useThemeContext } from '../../theme/index';

type ConditionalStatementWrapperProps = {
	headerText: string;
	simpleRestrictions?: ReactNode;
	conditionalRestrictions?: ReactNode;
	isContainer?: boolean;
};

const containerStyle = (theme: Theme) => css`
	display: flex;
	flex-direction: column;
	gap: 4px;
	align-items: flex-start;
	${theme.typography.paragraphSmall}
	color: ${theme.colors.black};
`;

const simpleRestrictionsContainerStyle = css`
	margin-left: 44px;
`;

const simpleRestrictionsInlineStyle = css`
	margin-left: 4px;
`;

const conditionalRestrictionsStyle = css`
	display: flex;
	flex-direction: column;
`;

/**
 * Wrapper component for conditional statements with optional container styling
 *
 * @param headerText - The header text to display
 * @param simpleRestrictions - The simple restrictions to render
 * @param conditionalRestrictions - The conditional restrictions to render
 * @param isContainer - Whether to render as a container with children below
 * @returns Wrapper component with conditional statement styling
 */
export const ConditionalStatementWrapper = ({
	headerText,
	simpleRestrictions,
	conditionalRestrictions,
	isContainer,
}: ConditionalStatementWrapperProps) => {
	const theme = useThemeContext();

	return isContainer ?
			<div css={containerStyle(theme)}>
				<span>
					<b>{headerText}</b>
				</span>
				{simpleRestrictions && <span css={simpleRestrictionsContainerStyle}>{simpleRestrictions}</span>}
				{conditionalRestrictions && <div css={conditionalRestrictionsStyle}>{conditionalRestrictions}</div>}
			</div>
		:	<div css={containerStyle(theme)}>
				<div>
					<b>{headerText}</b>
					{simpleRestrictions && <span css={simpleRestrictionsInlineStyle}>{simpleRestrictions}</span>}
				</div>
				{conditionalRestrictions}
			</div>;
};

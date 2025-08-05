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
import { ReactNode } from 'react';

import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';

type ConditionalStatementWrapperProps = {
	headerText: string;
	simpleRestrictions?: ReactNode;
	conditionalRestrictions?: ReactNode;
};

const containerStyle = (theme: Theme) => css`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	color: ${theme.colors.black};
`;

const headerStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmallBold}
`;

/**
 * Wrapper component for conditional statements with consistent styling
 *
 * @param headerText - The header text to display
 * @param simpleRestrictions - The simple restrictions to render
 * @param conditionalRestrictions - The conditional restrictions to render
 * @returns Wrapper component with conditional statement styling
 */
export const ConditionalStatementWrapper = ({
	headerText,
	simpleRestrictions,
	conditionalRestrictions,
}: ConditionalStatementWrapperProps) => {
	const theme = useThemeContext();

	return (
		<div css={containerStyle(theme)}>
			<div css={headerStyle(theme)}>{headerText}</div>
			{simpleRestrictions}
			{conditionalRestrictions}
		</div>
	);
};

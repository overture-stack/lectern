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
import { ConditionalRestrictionTest } from '@overture-stack/lectern-dictionary';

import { Theme } from '../../theme';
import { useThemeContext } from '../../theme/ThemeContext';
import { ConditionalRestrictionDetails } from './ConditionalRestrictionDetails';

export type IfStatementProps = {
	conditionalRestriction: ConditionalRestrictionTest;
};

const containerStyle = (theme: Theme) => css`
	display: flex;
	flex-direction: row;
	gap: 4px;
	align-items: center;
	color: ${theme.colors.black};
	${theme.typography.paragraphSmall}
`;

/**
 * Renders an if statement based on conditional restrictions
 *
 * @param ifStatement - The conditional restriction data
 * @returns A rendered if statement component
 */

export const IfStatement = ({ conditionalRestriction }: IfStatementProps) => {
	const theme: Theme = useThemeContext();
	return (
		<div css={containerStyle(theme)}>
			<b>IF</b> the field(s)
			{ConditionalRestrictionDetails(conditionalRestriction.conditions, conditionalRestriction.case || 'all')}
		</div>
	);
};

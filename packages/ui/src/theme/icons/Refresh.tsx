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

import IconProps from './IconProps';

const Refresh = ({ fill, width, height, style }: IconProps) => {
	return (
		<svg
			css={css`
				${style}
			`}
			width={width || 12}
			height={height || 12}
			viewBox="0 0 14 14"
			fill="none"
		>
			<path
				d="M0.75 6.75001C0.75 7.93669 1.10189 9.09673 1.76118 10.0834C2.42047 11.0701 3.35754 11.8392 4.4539 12.2933C5.55026 12.7474 6.75665 12.8662 7.92054 12.6347C9.08443 12.4032 10.1535 11.8318 10.9926 10.9926C11.8318 10.1535 12.4032 9.08443 12.6347 7.92055C12.8662 6.75666 12.7474 5.55026 12.2933 4.45391C11.8391 3.35755 11.0701 2.42048 10.0834 1.76119C9.09672 1.1019 7.93669 0.750008 6.75 0.750008C5.07263 0.756318 3.46265 1.41082 2.25667 2.57667L0.75 4.08334M0.75 4.08334V0.750008M0.75 4.08334H4.08333"
				stroke={fill || '#757575'}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default Refresh;

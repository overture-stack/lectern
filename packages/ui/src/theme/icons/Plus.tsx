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

import IconProps from './IconProps';

const Plus = ({ fill, width, height, style }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width || '18'}
			height={height || '18'}
			viewBox="0 0 18 18"
			css={style}
			fill="none"
		>
			<path
				d="M8.29688 0.5625H9.70312C9.82812 0.5625 9.89062 0.625 9.89062 0.75V17.25C9.89062 17.375 9.82812 17.4375 9.70312 17.4375H8.29688C8.17188 17.4375 8.10938 17.375 8.10938 17.25V0.75C8.10938 0.625 8.17188 0.5625 8.29688 0.5625Z"
				fill={fill || 'black'}
			/>
			<path
				d="M1.125 8.10938H16.875C17 8.10938 17.0625 8.17188 17.0625 8.29688V9.70312C17.0625 9.82812 17 9.89062 16.875 9.89062H1.125C1 9.89062 0.9375 9.82812 0.9375 9.70312V8.29688C0.9375 8.17188 1 8.10938 1.125 8.10938Z"
				fill={fill || 'black'}
			/>
		</svg>
	);
};

export default Plus;

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

const Key = ({ fill, width, height, style }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width || 16}
			height={height || 16}
			viewBox="0 0 18 18"
			fill={fill || 'none'}
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			css={css`
				${style}
			`}
		>
			<path d="M12.0284 5.63158L13.9073 7.56842C14.06 7.72272 14.2653 7.80914 14.4791 7.80914C14.6929 7.80914 14.8983 7.72272 15.051 7.56842L16.7665 5.8C16.9162 5.64259 17 5.43095 17 5.21053C17 4.9901 16.9162 4.77847 16.7665 4.62105L14.8876 2.68421M16.5214 1L8.67901 9.08421M9.98608 12.3684C9.98608 14.9264 7.97447 17 5.49304 17C3.0116 17 1 14.9264 1 12.3684C1 9.81047 3.0116 7.73684 5.49304 7.73684C7.97447 7.73684 9.98608 9.81047 9.98608 12.3684Z" />
		</svg>
	);
};

export default Key;

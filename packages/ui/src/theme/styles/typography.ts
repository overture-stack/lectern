/**
 * Copyright (c) 2022 The Ontario Institute for Cancer Research. All rights reserved
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

import { css } from '@emotion/react';

const baseFont = css`
	font-family: 'Lato', sans-serif;
`;

const baseFontSecondary = css`
	font-family: 'Open Sans', sans-serif;
`;

const hero = css`
	${baseFont}
	font-size: 40px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const title = css`
	${baseFont}
	font-size: 26px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const subtitle = css`
	${baseFont}
	font-size: 30px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const subtitleSecondary = css`
	${baseFont}
	font-size: 20px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const introText = css`
	${baseFontSecondary}
	font-size: 18px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const regular = css`
	${baseFont}
	font-size: inherit;
	font-weight: inherit;
	font-style: inherit;
	font-stretch: inherit;
	line-height: inherit;
	letter-spacing: inherit;
`;

const paragraph = css`
	${baseFontSecondary}
	font-size: 26px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const paragraphBold = css`
	${baseFontSecondary}
	font-size: 26px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const paragraphSmall = css`
	${baseFontSecondary}
	font-size: 16px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const paragraphSmallBold = css`
	${baseFontSecondary}
	font-size: 16px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const data = css`
	${baseFontSecondary}
	font-size: 13px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const dataBold = css`
	${baseFontSecondary}
	font-size: 13px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const caption = css`
	${baseFontSecondary}
	font-size: 11px;
	font-weight: 400;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

const captionBold = css`
	${baseFontSecondary}
	font-size: 11px;
	font-weight: 700;
	font-style: normal;
	font-stretch: normal;
	line-height: 100%;
	letter-spacing: 0%;
`;

export default {
	hero,
	title,
	subtitle,
	subtitleSecondary,
	introText,
	regular,
	paragraph,
	paragraphBold,
	paragraphSmall,
	paragraphSmallBold,
	data,
	dataBold,
	caption,
	captionBold,
};

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

const baseFontMono = css`
	font-family: 'B612 Mono', monospace;
`;

const hero = css`
	${baseFont}
	font-size: 40px;
	font-weight: 400;
	line-height: 100%;
`;

const title = css`
	${baseFont}
	font-size: 26px;
	font-weight: 400;
	line-height: 100%;
`;

const subtitle = css`
	${baseFont}
	font-size: 30px;
	font-weight: 400;
	line-height: 100%;
`;

const subtitleBold = css`
	${subtitle}
	font-weight: 700;
`;

const subtitleSecondary = css`
	${baseFont}
	font-size: 20px;
	font-weight: 700;
	line-height: 100%;
`;

const introText = css`
	${baseFontSecondary}
	font-size: 18px;
	font-weight: 400;
	line-height: 130%;
`;

const introTextBold = css`
	${introText}
	font-weight: 700;
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
	line-height: 130%;
`;

const paragraphBold = css`
	${paragraph}
	font-weight: 700;
`;

const paragraphSmall = css`
	${baseFontSecondary}
	font-size: 16px;
	font-weight: 400;
	line-height: 140%;
`;

const paragraphSmallBold = css`
	${paragraphSmall}
	font-weight: 700;
`;

const data = css`
	${baseFontSecondary}
	font-size: 13px;
	font-weight: 400;
	line-height: 150%;
`;

const dataBold = css`
	${data}
	font-weight: 700;
`;

const caption = css`
	${baseFontSecondary}
	font-size: 11px;
	font-weight: 400;
	line-height: 150%;
`;

const captionBold = css`
	${caption}
	font-weight: 700;
`;

const headingSmall = css`
	${baseFont}
	font-size: 24px;
	font-weight: 700;
	line-height: 100%;
`;

const buttonText = css`
	${baseFont}
	font-size: 20px;
	font-weight: 700;
	line-height: 1.5;
	vertical-align: middle;
`;

const body = css`
	${baseFont}
	font-size: 18px;
	font-weight: 400;
	line-height: 140%;
`;

const bodyBold = css`
	${body}
	font-weight: 700;
`;

const fieldBlock = css`
	${baseFontMono}
	font-size: 16px;
	font-weight: 400;
	line-height: 100%;
	text-align: center;
	vertical-align: middle;
`;

const tableHeader = css`
	${baseFont}
	font-size: 20px;
	font-weight: 600;
	line-height: 20px;
	vertical-align: middle;
`;

export default {
	hero,
	title,
	subtitle,
	subtitleBold,
	subtitleSecondary,
	introText,
	introTextBold,
	regular,
	paragraph,
	paragraphBold,
	paragraphSmall,
	paragraphSmallBold,
	data,
	dataBold,
	caption,
	captionBold,
	headingSmall,
	buttonText,
	body,
	bodyBold,
	fieldBlock,
	tableHeader,
};

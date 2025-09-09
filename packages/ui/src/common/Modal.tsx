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

import { css, Global } from '@emotion/react';
import { type ReactNode } from 'react';
import Modal, { type Styles } from 'react-modal';

import { type Theme } from '../theme/index';
import Cancel from '../theme/icons/Cancel';
import { useThemeContext } from '../theme/index';
import Button from './Button';

export type ModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	onAfterOpen?: () => void;
	children?: ReactNode;
	title: string;
};

// Using react-modal's built-in styling system instead of emotion css for modal configuration
const customStyles = (theme: Theme): Styles => ({
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		transform: 'translate(-50%, -50%)',
		width: '95%',
		maxWidth: '1200px',
		maxHeight: '80vh',
		padding: 0,
		overflow: 'hidden',
		borderRadius: '8px',
		boxShadow: `0 2px 6px ${theme.shadow.subtle}, 0 0 0 0.3px ${theme.colors.black}`,
		transition: 'all 0.3s ease',
		display: 'flex',
		flexDirection: 'column',
	},
	overlay: {
		backgroundColor: theme.colors.background_overlay,
		zIndex: 1000,
	},
});

const headerStyle = (theme: Theme) => css`
	${theme.typography.title}
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid ${theme.colors.border_subtle};
	background: ${theme.colors.white};
	box-shadow: 0px 1px 6px 0px #00000026;
`;

const bodyStyle = css`
	padding: 20px 30px;
	overflow-y: auto;
	flex: 1;
	min-height: 0;
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography.subtitleBold};
	color: ${theme.colors.accent};
`;
Modal.setAppElement('body');
const ModalComponent = ({ children, setIsOpen, isOpen, onAfterOpen, title }: ModalProps) => {
	const theme: Theme = useThemeContext();
	return (
		<>
			<Global
				styles={css`
					body.modal-open {
						overflow: hidden;
					}
				`}
			/>
			<Modal
				isOpen={isOpen}
				onAfterOpen={onAfterOpen}
				onRequestClose={() => setIsOpen(false)}
				style={customStyles(theme)}
				contentLabel={title}
				bodyOpenClassName="modal-open"
			>
				<div css={headerStyle(theme)}>
					<span css={titleStyle(theme)}>{title}</span>
					<Button iconOnly onClick={() => setIsOpen(false)} icon={<Cancel />} />
				</div>
				<div css={bodyStyle}>{children}</div>
			</Modal>
		</>
	);
};

export default ModalComponent;

/*
 *
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
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
import Modal, { Styles } from 'react-modal';

import type { Theme } from '../../theme';
import Cancel from '../../theme/icons/Cancel';
import { useThemeContext } from '../../theme/ThemeContext';
import Button from '../Button';
import { ErrorMessage } from './ErrorMessage';

Modal.setAppElement('body');

const customStyles = (theme: Theme): Styles => ({
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		transform: 'translate(-50%, -50%)',
		width: '40%',
		maxHeight: '50%',
		padding: 0,
		overflow: 'hidden',
		borderRadius: '10px',
		border: '0.25px solid #000000',
		boxShadow: '0px 4px 4px 0px #0000001A',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: theme.colors.error_modal_bg,
		position: 'relative',
	},
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 1000,
	},
});

const containerStyle = css`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px;
	height: 100%;
	overflow-y: auto;
`;

const titleStyle = (theme: Theme) => css`
	${theme.typography.subtitleBold}
	color: ${theme.colors.error_dark};
	margin: 0;
`;

const subtitleStyle = (theme: Theme) => css`
	${theme.typography.dataBold}
	margin: 0;
`;

const descriptionStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmall}
	margin: 0;
`;

const contactLinkStyle = (theme: Theme) => css`
	${theme.typography.paragraphSmallBold}
	text-decoration: underline;
	margin: 0;
	cursor: pointer;
`;

const errorListStyle = css`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 8px;
`;

const closeButtonStyle = css`
	position: absolute;
	top: 8px;
	right: 8px;
	background: transparent;
	border: none;

	&:hover {
		background: transparent;
	}
`;

export type ErrorModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	errors: string[];
	onContactClick?: () => void;
};

/**
 * Modal component that displays error messages with a list format
 *
 * @param setIsOpen - Function to control modal open/close state
 * @param isOpen - Current open state of the modal
 * @param errors - Array of error messages to display
 * @param onContactClick - Optional callback function for when the contact link is clicked
 * @returns Modal component with error visualization
 */
export const ErrorModal = ({ setIsOpen, isOpen, errors, onContactClick }: ErrorModalProps) => {
	const theme: Theme = useThemeContext();

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={() => setIsOpen(false)}
			style={customStyles(theme)}
			contentLabel="Error Modal"
		>
			<Button
				iconOnly
				onClick={() => setIsOpen(false)}
				icon={<Cancel fill={theme.colors.black} />}
				styleOverride={closeButtonStyle}
			/>
			<div css={containerStyle}>
				<h1 css={titleStyle(theme)}>Error</h1>
				<p css={subtitleStyle(theme)}>view console logs for more details</p>
				<p css={descriptionStyle(theme)}>
					The dictionary controller has returned errors. If you are seeing this{' '}
					<span css={contactLinkStyle(theme)} onClick={onContactClick} role="button" tabIndex={0}>
						please contact the platform administrator.
					</span>
				</p>
				<div css={errorListStyle}>
					{errors.map((error, index) => (
						<ErrorMessage key={index} message={error} />
					))}
				</div>
			</div>
		</Modal>
	);
};

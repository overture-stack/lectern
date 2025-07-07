import React from 'react';
import Modal from 'react-modal';

export type ModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
	onAfterOpen?: () => void;
};

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
	},
};

const ModalComponent = ({ setIsOpen, isOpen, onAfterOpen }: ModalProps) => {
	const openModal = () => {
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	return (
		<Modal
			isOpen={isOpen}
			onAfterOpen={onAfterOpen}
			onRequestClose={closeModal}
			style={customStyles}
			contentLabel="Example Modal"
		>
			<h2>Hello</h2>
			<button onClick={closeModal}>close</button>
			<div>I am a modal</div>
			<form>
				<input />
				<button>tab navigation</button>
				<button>stays</button>
				<button>inside</button>
				<button>the modal</button>
			</form>
		</Modal>
	);
};
export default ModalComponent;

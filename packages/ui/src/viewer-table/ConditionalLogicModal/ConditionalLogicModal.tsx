import Modal from '../../common/Modal';

export type ConditionalLogicModalProps = {
	setIsOpen: (isOpen: boolean) => void;
	isOpen: boolean;
};

const ConditionalLogicModal = ({ setIsOpen, isOpen }: ConditionalLogicModalProps) => {
	return (
		<Modal title="ConditionalLogic" setIsOpen={setIsOpen} isOpen={isOpen}>
			<p>Hello World</p>
		</Modal>
	);
};

export default ConditionalLogicModal;

/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '../../../src/common/Button';
import { ConditionalLogicModal } from '../../../src/viewer-table/ConditionalLogicModal/ConditionalLogicModal';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: ConditionalLogicModal,
	title: 'ConditionalLogic/ConditionalLogicModal',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ConditionalLogicModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isOpen: false,
		setIsOpen: () => {},
	},
	render: (args) => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
				<ConditionalLogicModal {...args} isOpen={isOpen} setIsOpen={setIsOpen} />
			</>
		);
	},
};

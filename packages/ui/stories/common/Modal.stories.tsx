/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '../../src/common/Button';
import ModalComponent from '../../src/common/Modal';
import themeDecorator from '../themeDecorator';

const meta = {
	component: ModalComponent,
	title: 'Common/Modal',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ModalComponent>;

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
				<ModalComponent {...args} isOpen={isOpen} setIsOpen={setIsOpen}>
					<p>This is the body of the modal.</p>
				</ModalComponent>
			</>
		);
	},
};

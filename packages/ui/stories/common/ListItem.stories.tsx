/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import ListItem from '../../src/common/ListItem';
import themeDecorator from '../themeDecorator';

const meta = {
	component: ListItem,
	title: 'Common/ListItem',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: 'BRCA1' },
};

export const Short: Story = {
	args: { children: 'TP53' },
};

export const Long: Story = {
	args: { children: 'CHROMOSOME_X' },
};

export const AverageUseCase: Story = {
	args: { children: 'Gene_ABC123' },
};

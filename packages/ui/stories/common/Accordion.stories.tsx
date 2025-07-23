/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import Accordion from '../../src/common/Accordion/Accordion';
import themeDecorator from '../themeDecorator';

const meta = {
	component: Accordion,
	title: 'Common/Accordion',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		collapseAll: false,
		accordionItems: [
			{
				title: 'Study',
				description: 'Research studies enrolling participants',
				content: 'Content for study schema',
				schemaName: 'Study',
			},
		],
	},
};

export const LongDescription: Story = {
	args: {
		collapseAll: false,
		accordionItems: [
			{
				title: 'Study with a long description',
				description:
					'Do MagNisiDoAmet sit adipisicing dolore incididunt minim.lore pariatur sit ex eiusmod Lorem do voluptate id aliquip occaecat duis. laMinim fugiatEnim qui irure incididunt ex proident qui reprehenderit enim. deserunt irure mollit do aute do voluptate sint veniam commodo excepteur officia.borum mollit aute eu ea dolor adipisicing et.na Cupidatat nostrud adipisicing nulla fugiat laboris laborum aliquip adipisicing minim incididunt laboris.non ipsum dolore anim eiusmod velit amet enim veniam ut ad est.fugiat nisi elit nisi non aliqua qui duis et consectetur.Labore proident qui id ad laborum mollit amet do officia sint qui mollit.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cillum ex qui pariatur sint est elit amet commodo dolore duis exercitation cupidatat anim deserunt. Commodo mollit labore et qui sit consectetur laborum eiusmod.',
				content: 'Content for study schema',
				schemaName: 'Study',
			},
		],
	},
};
export const Expanded: Story = {
	args: {
		collapseAll: true,
		accordionItems: [
			{
				title: 'Study',
				description: 'Research studies enrolling participants',
				content: 'Content for study schema',
				schemaName: 'Study',
			},
		],
	},
};

export const Empty: Story = {
	args: { accordionItems: [], collapseAll: true },
};

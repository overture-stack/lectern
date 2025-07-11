/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import DictionaryDownloadButton, {
	DictionaryDownloadButtonProps,
} from '../../../src/viewer-table/InteractionPanel/DownloadTemplatesButton';
import themeDecorator from '../../themeDecorator';

const meta = {
	component: DictionaryDownloadButton,
	title: 'Viewer - Table/Interaction - Panel/DictionaryDownloadButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DictionaryDownloadButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockDictionaryDownloadButtonProps: DictionaryDownloadButtonProps = {
	version: '1.0',
	name: 'example-dictionary',
	lecternUrl: 'http://localhost:3031',
	fileType: 'tsv',
};

export const Default: Story = {
	args: {
		...mockDictionaryDownloadButtonProps,
	},
};

export const Disabled: Story = {
	args: {
		...mockDictionaryDownloadButtonProps,
		disabled: true,
	},
};

/** @jsxImportSource @emotion/react */

import type { Meta, StoryObj } from '@storybook/react';
import themeDecorator from '../../themeDecorator';
import DictionaryDownloadButton from '../../../src/viewer-table/InteractionPanel/DownloadTemplatesButton';
const meta = {
	component: DictionaryDownloadButton,
	title: 'Viewer - Table/Interaction - Panel/DictionaryDownloadButton',
	tags: ['autodocs'],
	decorators: [themeDecorator()],
} satisfies Meta<typeof DictionaryDownloadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};

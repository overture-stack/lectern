import { Preview } from '@storybook/react';
// import {PaintBrushIcon} from '@storybook/icons';

import { themes } from '@storybook/theming';

const preview: Preview = {
	globalTypes: {
		theme: {
			description: 'Display theme used for all components with the themeDecorator.',
			toolbar: {
				icon: 'paintbrush',
				items: [
					{ value: 'default', right: '✅', title: 'Default Theme' },
					{ value: 'custom', right: '🎨', title: 'Custom Theme' },
				],
			},
		},
	},
	parameters: {
		docs: {
			theme: themes.light,
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;

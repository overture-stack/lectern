import { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';

const preview: Preview = {
	decorators: [
		(Story) => {
			const dmMonoLink = document.createElement('link');
			dmMonoLink.href =
				'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap';
			dmMonoLink.rel = 'stylesheet';
			document.head.appendChild(dmMonoLink);

			const latoLink = document.createElement('link');
			latoLink.href =
				'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap';
			latoLink.rel = 'stylesheet';
			document.head.appendChild(latoLink);

			return <Story />;
		},
	],
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

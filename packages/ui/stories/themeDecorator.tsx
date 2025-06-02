import type { Decorator } from '@storybook/react';
import type { PartialTheme } from '../src/theme';
import { ThemeProvider } from '../src/theme/ThemeContext';
import recursiveMerge from '../src/utils/recursiveMerge';

const customTheme: PartialTheme = { colors: { accent_dark: 'orange' } };
function getGlobalTheme(globalTheme: string): PartialTheme {
	switch (globalTheme) {
		case 'custom': {
			return customTheme;
		}
		default: {
			return {};
		}
	}
}

const themeDecorator =
	(customTheme: PartialTheme = {}): Decorator =>
	(Story, { globals: { theme } }) => {
		return (
			<ThemeProvider theme={recursiveMerge(getGlobalTheme(theme), customTheme)}>
				<Story />
			</ThemeProvider>
		);
	};

export default themeDecorator;

import type { Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/theme/ThemeContext';
import type { PartialTheme } from '../src/theme';
import recursiveMerge from '../src/utils/recursiveMerge';
import defaultTheme from '../src/theme';

const globalCustomTheme: PartialTheme = { colors: { accent_dark: 'orange' } };

const themeDecorator =
	(customTheme: PartialTheme = {}): Decorator =>
	(Story, { globals: { theme } }) => {
		const baseTheme = theme === 'custom' ? globalCustomTheme : {};
		return (
			<ThemeProvider theme={recursiveMerge(baseTheme, customTheme)}>
				<Story />
			</ThemeProvider>
		);
	};

export default themeDecorator;

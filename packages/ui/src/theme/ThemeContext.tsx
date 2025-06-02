import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import recursiveMerge from '../utils/recursiveMerge';
import { type RecursivePartial } from '../utils/RecursivePartial';
import defaultTheme, { type Theme } from './';

const ThemeContext = createContext<Theme>(defaultTheme);

export function useThemeContext(customTheme: RecursivePartial<Theme> = {}) {
	const theme = useContext(ThemeContext);

	return useMemo(() => recursiveMerge(theme, customTheme), [theme, customTheme]);
}

export function ThemeProvider(props: PropsWithChildren<{ theme?: RecursivePartial<Theme> }>) {
	const theme = useThemeContext(props.theme);

	return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

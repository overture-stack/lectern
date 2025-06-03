import colors from './styles/colors';
import typography from './styles/typography';
import shadow from './styles/shadow';
import dimensions from './styles/dimensions';
import type { RecursivePartial } from '../utils/RecursivePartial';

const defaultTheme = {
	colors,
	typography,
	shadow,
	dimensions,
};

export default defaultTheme;
export type Theme = typeof defaultTheme;
export type PartialTheme = RecursivePartial<Theme>;

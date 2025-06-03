import colors from './styles/colors';
import typography from './styles/typography';
import icons from './styles/icons';
import shadow from './styles/shadow';
import dimensions from './styles/dimensions';
import type { RecursivePartial } from '../utils/RecursivePartial';

const defaultTheme = {
	colors,
	icons,
	typography,
	shadow,
	dimensions,
};

export default defaultTheme;
export type Theme = typeof defaultTheme;
export type PartialTheme = RecursivePartial<Theme>;

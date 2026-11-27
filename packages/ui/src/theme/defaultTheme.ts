import colors from './styles/colors';
import typography from './styles/typography';
import icons from './styles/icons';
import shadow from './styles/shadow';
import dimensions from './styles/dimensions';
import type { RecursivePartial } from '../utils/RecursivePartial';
import components from './styles/components';

const defaultTheme = {
	colors,
	icons,
	typography,
	shadow,
	dimensions,
	components,
};

export default defaultTheme;
export type Theme = typeof defaultTheme;
export type PartialTheme = RecursivePartial<Theme>;

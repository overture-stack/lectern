import { addons } from '@storybook/manager-api';
// import { themes } from '@storybook/theming';
import overtureTheme from './overture-theme';

addons.setConfig({
	theme: overtureTheme,
});

const link = document.createElement('link');
link.setAttribute('rel', 'shortcut icon');
link.setAttribute('href', '/favicon.ico');
document.head.appendChild(link);

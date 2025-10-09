// Model + Controller Logic

export {
	// data - API integration
	DictionaryLecternDataProvider as LecternDataProvider,
	useDictionaryDataContext as useLecternData,
	type LecternDictionaryProviderProps as LecternDataProviderProps,
	// data - static/hosted alternatives
	DictionaryStaticDataProvider,
	type StaticDictionaryProviderProps,
	HostedDictionaryDataProvider,
	type UrlDictionaryProviderProps,
	// state
	DictionaryStateProvider as DictionaryTableStateProvider,
	useDictionaryStateContext as useDictionaryTableState,
	type DictionaryStateProviderProps as DictionaryTableStateProviderProps,
} from './dictionary-controller/DictionaryDataContext.js';

// View Components

export {
	// Dictionary Header
	DictionaryHeader,

	// Dictionary Table
	default as DictionaryTable, // the main component for this package
	type DictionaryTableProps,
	DictionaryTableViewer,

	// Schema Table
	default as SchemaTable,
	type SchemaTableProps,

	// Toolbar
	default as Toolbar,
	type ToolbarProps,

	// & individual parts for integrators to build their own
	AttributeFilterDropdown,
	CollapseAllButton,
	type CollapseAllButtonProps,
	DictionaryDownloadButton,
	type DictionaryDownloadButtonProps,
	DictionaryVersionSwitcher,
	ExpandAllButton,
	type ExpandAllButtonProps,
	TableOfContentsDropdown,
	type TableOfContentsDropdownProps,
} from './viewer-table/index';

export { default as Accordion, type AccordionProps } from './common/Accordion/index';

// exporting these to facilitate extensibility
export { defaultTheme, type Theme, type PartialTheme, ThemeProvider, useThemeContext } from './theme/index';

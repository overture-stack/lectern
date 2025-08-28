// Model + Controller Logic

export {
	// data
	DictionaryLecternDataProvider as LecternDataProvider,
	useDictionaryDataContext as useLecternData,
	type LecternDictionaryProviderProps as LecternDataProviderProps,
	// state
	DictionaryStateProvider as DictionaryTableStateProvider,
	useDictionaryStateContext as useDictionaryTableState,
	type DictionaryStateProviderProps as DictionaryTableStateProviderProps,
} from './dictionary-controller/DictionaryDataContext.js';

// View Components

export {
	DictionaryHeader,
	default as DictionaryTable, // the main component for this package
	type DictionaryTableProps,
} from './viewer-table/index';

export { default as Accordion, type AccordionProps } from './common/Accordion/index';

export { default as SchemaTable, type SchemaTableProps } from './viewer-table/DataTable/SchemaTable/index';

export {
	default as Toolbar,
	type ToolbarProps,

	// individual parts for integrators to build their own
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
} from './viewer-table/Toolbar/index';

// exporting these to facilitate extensibility
export { defaultTheme, type Theme, type PartialTheme, ThemeProvider, useThemeContext } from './theme/index';

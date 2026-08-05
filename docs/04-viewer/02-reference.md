# Viewer Reference

Every component, provider, hook, and type exported by [`@overture-stack/lectern-ui`](https://www.npmjs.com/package/@overture-stack/lectern-ui). For a task-oriented walkthrough see [Setup](./01-setup.md); for what each view shows a reader see the [Viewer overview](./index.md).

This page documents the library as it stands on `main`. Exports not yet in the published release are marked, and listed together under [Release status](#release-status).

:::note What this page is, and is not
This is an export listing: what the package exposes, the props and fields of each export, and which are released. For how a component *behaves*, and to see it rendered in every state, use [Storybook](./01-setup.md#run-storybook), which runs against the source and cannot drift from it.
:::

## Entry points

The package has two entry points:

| Import path | Contents |
| --- | --- |
| `@overture-stack/lectern-ui` | Everything below: the composed views, data providers, hooks, theme, and types. |
| `@overture-stack/lectern-ui/dictionary-table` | The table view's internals: `SchemaTable`, `Toolbar`, the individual toolbar buttons, and the loading skeletons. |

:::note
Import `SchemaTable` and `Toolbar` from the `/dictionary-table` entry point. The root entry point currently re-exports both names from the same default binding as `DictionaryTable`, so all three resolve to the composed page rather than the individual components.
:::

## Composed views

### `DictionaryTable`

The whole table view, wired to a Lectern server. Sets up `LecternDataProvider` and `DictionaryTableStateProvider` internally, so it needs no surrounding providers.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `lecternUrl` | `string` | Yes | Base URL of the Lectern server. |
| `dictionaryName` | `string` | Yes | Name of the dictionary to display. Every version is fetched; the newest renders first. |
| `filterDropdowns` | `FilterDropdown[]` | No | Adds [metadata filter dropdowns](#filterdropdown) to the toolbar. |
| `customColumns` | `CustomColumnConfig[]` | No | Adds [custom columns](#customcolumnconfig) to every schema table. Not in `1.0.0`. |

The prop type is exported as `DictionaryTableProps`.

### `DictionaryTableViewer`

The same view without the data and state providers, for platforms supplying their own [data source](#data-providers). Takes `filterDropdowns` and `customColumns` with the same meanings as above, and must be rendered inside a data provider and `DictionaryTableStateProvider`.

Requires no `lecternUrl` or `dictionaryName` of its own; it reads whatever the surrounding data provider loaded. The prop type is exported as `DictionaryTableViewerProps`.

## Data providers

Each data provider loads dictionaries and publishes them, along with loading and error state, through [`useLecternData`](#uselecterndata). Exactly one is needed.

| Component | Prop | Type | Description |
| --- | --- | --- | --- |
| `LecternDataProvider` | `lecternUrl` | `string` | Base URL of the Lectern server. |
| | `dictionaryName` | `string` | Dictionary to fetch. All versions are retrieved and sorted newest-first. |
| `HostedDictionaryDataProvider` | `hostedUrl` | `string` | URL of a single dictionary JSON file. Parsed against the Lectern meta-schema; a validation failure surfaces as an error rather than an empty view. |
| `DictionaryStaticDataProvider` | `staticDictionaries` | `(DictionaryServerRecord \| Dictionary)[]` | Dictionaries already in memory. No network request. |

Their prop types are exported as `LecternDataProviderProps`, `UrlDictionaryProviderProps`, and `StaticDictionaryProviderProps`.

### `DictionaryTableStateProvider`

Holds view state (the selected version, the required-fields filter, and active metadata filter selections) and must wrap the view inside whichever data provider is used. Takes only `children`. Its prop type is exported as `DictionaryTableStateProviderProps`.

Changing the selected version clears any active metadata filter selections, since a new version may not carry the same metadata values.

## Hooks

### `useLecternData`

:::warning Important
Throws when called outside a data provider.
:::

Returns what the active data provider loaded:

| Field | Type | Description |
| --- | --- | --- |
| `dictionaries` | `(DictionaryServerRecord \| Dictionary)[] \| undefined` | Loaded dictionaries, newest version first. |
| `lecternUrl` | `string \| undefined` | Set only by `LecternDataProvider`. Components use its presence to decide whether server-backed features, such as template download, are available. |
| `name` | `string \| undefined` | Requested dictionary name. Set only by `LecternDataProvider`. |
| `loading` | `boolean` | True while fetching. |
| `errors` | `string[]` | Fetch and validation failures. Empty on success. |

### `useDictionaryTableState`

:::warning Important
Throws when called outside `DictionaryTableStateProvider`.
:::

Returns the current view state and the setters that change it:

| Field | Type | Description |
| --- | --- | --- |
| `selectedDictionary` | `DictionaryServerRecord \| Dictionary \| undefined` | The version currently displayed. |
| `currentDictionaryIndex` | `number` | Its index in `dictionaries`. |
| `setCurrentDictionaryIndex` | `(index: number) => void` | Switches version. |
| `filters` | `'Required'[]` | Active attribute filter. Defaults to `['Required']`, so the view opens showing only required and conditionally required fields. |
| `setFilters` | `(filters: 'Required'[]) => void` | Sets the attribute filter. Pass `[]` to show every field. |
| `filterSelections` | `Record<string, string[]>` | Selected metadata filter values, keyed by `filterProperty`. |
| `toggleFilter` | `(filterProperty: string, value: string) => void` | Adds or removes one metadata filter value. |
| `resetFilters` | `() => void` | Clears all metadata filter selections. |

## Configuration types

### `FilterDropdown`

One toolbar dropdown that filters whole schemas by a metadata value.

| Property | Type | Description |
| --- | --- | --- |
| `label` | `string` | Dropdown label, also used on the active-filter pills. |
| `filterProperty` | `string` | Dot path on the schema to filter by, for example `meta.submitter`. Options are collected from the loaded dictionary. |

Selections are OR within one dropdown and AND across dropdowns. Array-valued metadata matches if any of its values are selected.

### `CustomColumnConfig`

One appended column on every schema table. Not in `1.0.0`.

| Property | Type | Description |
| --- | --- | --- |
| `columnHeader` | `string` | Column heading, and the label in the toolbar's Columns dropdown. |
| `metaPath` | `string` | Dot path to a value on the field, usually under `meta`. |
| `columnComponent` | `ComponentType<CustomColumnComponentProps>` | Renders the cell instead of the default renderer. |
| `defaultVisible` | `boolean` | Start the column hidden with `false`. Defaults to `true`. |

At least one of `metaPath` and `columnComponent` is required; the type enforces this.

### `CustomColumnComponentProps`

What a `columnComponent` receives. Not in `1.0.0`.

| Property | Type | Description |
| --- | --- | --- |
| `field` | `SchemaField` | The whole field, so a cell can fall back to other field properties. |
| `metaPath` | `string \| undefined` | The configured dot path, if any. |
| `value` | `DictionaryMetaValue \| DictionaryMeta \| undefined` | Value resolved at `metaPath`. Undefined when the path is absent or resolves to something outside the dictionary metadata types. |

### `FilterCategory`

A resolved filter dropdown: a `FilterDropdown` plus the `options: string[]` discovered in the dictionary. Built internally from `filterDropdowns`; needed only when driving `Toolbar` directly.

## Individual components

Available from `@overture-stack/lectern-ui/dictionary-table` for platforms assembling their own layout. All of them read the dictionary and view state from context rather than props, unless listed below.

| Component | Props | Description |
| --- | --- | --- |
| `SchemaTable` | `schema`, `highlightedFieldName?`, `customColumns?` | One schema's fields as a table. The only view component that takes its schema by prop. |
| `Toolbar` | `onSelect`, `setIsCollapsed`, `isCollapsed`, `filterCategories?`, `columnVisibility?` | The full toolbar. The caller owns collapse state and schema selection. |
| `DictionaryHeader` | none | Dictionary name, description with a "Show more" control, and the version switcher. |
| `DictionaryVersionSwitcher` | none | Version dropdown, labelled with each version and its creation date. Renders nothing when only one version is loaded. |
| `TableOfContentsDropdown` | `schemas`, `onSelect` | Jump-to-schema dropdown. |
| `AttributeFilterButton` | none | Toggles the required-fields filter. |
| `CollapseAllButton` | `onClick` | Collapse-all control. |
| `ExpandAllButton` | `onClick` | Expand-all control. |
| `DictionaryDownloadButton` | `fileType`, `iconOnly?`, `schemaName?`, `text?`, `tooltipText?` | Submission template download. `fileType` is `'tsv'` or `'csv'`; `schemaName` limits the download to one schema. Renders nothing unless a `lecternUrl` is in context. |
| `MetaValueRenderer` | `value` | The default custom-column cell renderer. Handles strings, numbers, booleans, arrays, and nested objects, and renders URL strings as links. Not in `1.0.0`. |
| `Accordion` | `accordionItems`, `collapseAll`, `selectedIndex?` | The collapsible section list the table view is built from. Also exported from the root entry point. |

The loading skeletons (`LoadingSpinnerPage`, `HeaderSkeleton`, and `ToolbarSkeleton`) are exported from the same entry point.

## Theming

| Export | Type | Description |
| --- | --- | --- |
| `ThemeProvider` | Component | Supplies a theme. Takes an optional `theme` prop, deep-merged into the active theme, so partial overrides are valid. |
| `defaultTheme` | `Theme` | The theme used when no provider is present. |
| `useThemeContext` | `(overrides?: PartialTheme) => Theme` | Reads the active theme, optionally merging per-call overrides. |
| `Theme` | Type | The full theme: `colors`, `typography`, `dimensions`, `shadow`, and `icons`. |
| `PartialTheme` | Type | A recursively partial `Theme`, for passing to `ThemeProvider`. |

### Theme structure

`Theme` is inferred from `defaultTheme`, so the groups below are the complete set of what a `PartialTheme` can override. Each links to its definition, which is the authoritative list of tokens and their values.

| Group | Controls | Source |
| --- | --- | --- |
| `colors` | Surface, text, border, and accent colours, including the palettes the table, toolbar, and filter pills draw from. | [`colors.ts`](https://github.com/overture-stack/lectern/blob/main/packages/ui/src/theme/styles/colors.ts) |
| `typography` | Font family, and the size, weight, and line height of each text role used by the components. | [`typography.ts`](https://github.com/overture-stack/lectern/blob/main/packages/ui/src/theme/styles/typography.ts) |
| `dimensions` | Fixed measurements such as navbar height and the spacing the layout is built on. | [`dimensions.ts`](https://github.com/overture-stack/lectern/blob/main/packages/ui/src/theme/styles/dimensions.ts) |
| `shadow` | Elevation presets applied to raised surfaces such as dropdown menus. | [`shadow.ts`](https://github.com/overture-stack/lectern/blob/main/packages/ui/src/theme/styles/shadow.ts) |
| `icons` | The built-in icon components, each overridable individually. | [`icons/`](https://github.com/overture-stack/lectern/tree/main/packages/ui/src/theme/icons) |

## Utilities

| Export | Signature | Description |
| --- | --- | --- |
| `getByDotPath` | `(obj: unknown, path: string) => unknown` | Resolves a dot path, returning `undefined` rather than throwing on a missing segment. The same resolution used by custom columns and metadata filters. Not in `1.0.0`. |
| `sortDictionariesByVersion` | `(dictionaries: DictionaryServerUnion[]) => DictionaryServerUnion[]` | Sorts newest version first, comparing versions numerically. Applied by every data provider. |

## Release status

The published release is `1.0.0`. These exports exist only on `main`:

| Export | Feature |
| --- | --- |
| `CustomColumnConfig`, `CustomColumnComponentProps` | Custom column configuration |
| `MetaValueRenderer` | Default custom-column cell renderer |
| `getByDotPath` | Dot-path resolution utility |
| `customColumns` prop on `DictionaryTable` and `DictionaryTableViewer` | Custom columns, and the toolbar's Columns dropdown |

Everything else on this page is in `1.0.0`, including the entity relationship diagram, metadata filters, the active-filter bar, and URL-hash deep links.

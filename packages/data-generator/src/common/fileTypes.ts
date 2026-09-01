/** Column delimiter format for data files. `'tsv'` uses tab; `'csv'` uses comma. */
export type DataFileFormat = 'tsv' | 'csv';

/** Maps each `DataFileFormat` to its column delimiter character. */
export const COLUMN_DELIMITER = {
	tsv: '\t',
	csv: ',',
};

/** Maps each `DataFileFormat` to its file extension, including the leading dot. */
export const FILE_EXTENSION = {
	tsv: '.tsv',
	csv: '.csv',
} as const satisfies Record<DataFileFormat, string>;

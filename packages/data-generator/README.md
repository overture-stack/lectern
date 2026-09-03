# Data Generator

Internal test utility package for generating data that conforms to any given Lectern Data Dictionary.

Used by `packages/validation` and other packages that need programmatically generated test data for performance and correctness testing.

This package is **private** and not published to NPM.

---

## Usage

### Generating records in memory

```ts
import {
	generateRecord,
	generateSchemaRecords,
	generateDictionaryRecords,
} from '@overture-stack/lectern-data-generator';
import { donorSchema, sampleSchema, myDictionary } from './fixtures';

// Generate a single record conforming to a schema
const record = generateRecord(donorSchema, { seed: 42 });

// Generate a record with a specific field value forced
const recordWithOverride = generateRecord(donorSchema, {
	overrides: { id: 'DUPLICATE-ID' },
});

// Generate a child record whose foreign key fields are drawn from an existing set of parent rows
const parentRows = [{ id: 'P001' }, { id: 'P002' }];
const childRecord = generateRecord(sampleSchema, {
	seed: 42,
	foreignKeyPool: new Map([['donor', parentRows]]),
});

// Lazily generate 10,000 records for a schema - one at a time, without buffering
for (const record of generateSchemaRecords(donorSchema, { count: 10_000, seed: 42 })) {
	process(record);
}

// Lazily generate records for an entire dictionary in foreign key dependency order
// Parent schema records are yielded before their child schema records
for (const { schemaName, record } of generateDictionaryRecords(myDictionary, {
	counts: { donor: 1_000, sample: 5_000 },
	seed: 42,
})) {
	process(schemaName, record);
}
```

### Writing generated data to files

```ts
import { generateSchemaFile, generateDictionaryFiles } from '@overture-stack/lectern-data-generator';
import { donorSchema, myDictionary } from './fixtures';

// Write 10,000 records to a new TSV file - streams to disk without buffering
const schemaResult = await generateSchemaFile(donorSchema, '/tmp/output', 'tsv', {
	count: 10_000,
	seed: 42,
});
if (!schemaResult.success) {
	// schemaResult.data.error is 'DIRECTORY_NOT_FOUND' | 'FILE_ALREADY_EXISTS'
	console.error(schemaResult.data.error);
}

// Write records for every schema in a dictionary to separate files in one call
// All file paths are checked before any writing begins - no partial output on failure
const dictionaryResult = await generateDictionaryFiles(myDictionary, '/tmp/output', 'tsv', {
	counts: { donor: 1_000, sample: 5_000 },
	seed: 42,
});
if (!dictionaryResult.success) {
	console.error(dictionaryResult.data.error);
}
// Produces: /tmp/output/donor.tsv, /tmp/output/sample.tsv
```

---

## API Documentation

### Table of Contents

- [Data Generator](#data-generator)
	- [Usage](#usage)
		- [Generating records in memory](#generating-records-in-memory)
		- [Writing generated data to files](#writing-generated-data-to-files)
	- [API Documentation](#api-documentation)
		- [Table of Contents](#table-of-contents)
	- [Generator Behaviour](#generator-behaviour)
		- [Seeded generation](#seeded-generation)
		- [Field Generation](#field-generation)
			- [Conditional restrictions](#conditional-restrictions)
			- [Empty fields](#empty-fields)
			- [Generator failures](#generator-failures)
			- [Reference tags in restrictions](#reference-tags-in-restrictions)
		- [Record Generation](#record-generation)
			- [Field dependency ordering](#field-dependency-ordering)
			- [Foreign key constraints](#foreign-key-constraints)
		- [Schema and Dictionary Generation](#schema-and-dictionary-generation)
			- [Unique field constraints](#unique-field-constraints)
			- [Unique key constraints](#unique-key-constraints)
			- [Foreign key dependency ordering across schemas](#foreign-key-dependency-ordering-across-schemas)
		- [API - Functions](#api---functions)
			- [`generateStringValue`](#generatestringvalue)
			- [`generateIntegerValue`](#generateintegervalue)
			- [`generateNumberValue`](#generatenumbervalue)
			- [`generateBooleanValue`](#generatebooleanvalue)
			- [`generateRecord`](#generaterecord)
			- [`generateSchemaRecords`](#generateschemarecords)
			- [`generateDictionaryRecords`](#generatedictionaryrecords)
			- [`generateSchemaFile`](#generateschemafile)
			- [`generateDictionaryFiles`](#generatedictionaryfiles)
		- [API - Types](#api---types)
			- [`FieldGenerator`](#fieldgenerator)
			- [`FieldGeneratorOptions`](#fieldgeneratoroptions)
			- [`FieldGeneratorResult`](#fieldgeneratorresult)
			- [`ForeignKeyPool`](#foreignkeypool)
			- [`RecordGeneratorOptions`](#recordgeneratoroptions)
			- [`SchemaGeneratorOptions`](#schemageneratoroptions)
			- [`DictionaryGeneratorOptions`](#dictionarygeneratoroptions)
			- [`DictionaryRecord`](#dictionaryrecord)
			- [`DataFileFormat`](#datafileformat)
			- [`GenerateFileError`](#generatefileerror)

---

## Generator Behaviour

### Seeded generation

All generators accept an optional `seed` number. When provided, the same seed and the same schema always produce the same output - useful for snapshot tests and repeatable performance benchmarks.

**Important:** reproducibility depends on the schema remaining unchanged. Modifying a field's restrictions (adding a `codeList`, tightening a `range`, etc.) will produce different values even with the same seed.

When no seed is provided, a random seed is chosen at runtime and output is non-deterministic.

### Field Generation

#### Conditional restrictions

Field definitions in Lectern schemas can include conditional restrictions (`if/then/else` blocks) that activate different restrictions depending on the values of other fields in the same record. Each field generator accepts an optional `record` parameter - a partial copy of the record being built - so that the correct restriction branch can be resolved before generating the value.

When `record` is omitted or a referenced field is absent from the provided record, the missing field is treated as `undefined`.

#### Empty fields

By default, each generator has a 25% chance of returning `undefined` instead of a generated value for any field that does not carry a `required: true` restriction. This reflects the reality that optional fields in real datasets are frequently absent.

The rate is controlled by the `emptyRate` option on `FieldGeneratorOptions`, `RecordGeneratorOptions`, `SchemaGeneratorOptions`, and `DictionaryGeneratorOptions`:

- `emptyRate: 0` - never produce empty fields; always generate a value.
- `emptyRate: 1` - always produce empty fields for non-required fields.
- `emptyRate: 0.25` - default; approximately one field in four is left empty.

The empty check is seeded alongside the value draw, so the same seed always produces the same empty/non-empty outcome.

#### Generator failures

Dictionaries can specify restrictions that are contradictory, making it impossible to generate a valid value. In these cases the generator returns a failure result rather than throwing. The returned object contains:

- A fallback value (best-effort, may not satisfy all restrictions).
- A list of conflicts describing which restrictions could not be reconciled.

Restriction combinations that can produce a failure:

- **Multiple `codeList` restrictions with no common values** - the intersection of two or more code lists is empty.
- **Multiple `range` restrictions that do not overlap** - the merged lower bound exceeds the merged upper bound, or both bounds are equal and at least one is exclusive.
- **`codeList` and `range` together with no intersection** - none of the code list values fall within the specified range.
- **`codeList` and `regex` together with no intersection** - none of the code list values match the specified regex pattern.

Callers should check `result.success` before using the value in a context that requires a valid record.

#### Reference tags in restrictions

A resolved Lectern dictionary replaces all references with their concrete values before use. If a dictionary is passed to the generators with unresolved references still present (strings starting with `#/`), those entries are silently skipped. The generator continues with whichever concrete values remain.

If all entries in a `codeList` are reference tags, the generator falls back to producing an arbitrary value of the appropriate type, as though no `codeList` restriction were present.

### Record Generation

#### Field dependency ordering

`generateRecord` statically analyses the schema's conditional restrictions to build a dependency map between fields. Fields are then generated in topological order: any field that conditionally references another field is always generated after the field it depends on, so the partial record available to each generator reflects the correct values when evaluating conditional branches.

If a dependency cycle exists (field A conditionally references field B, and field B conditionally references field A), all fields involved in the cycle are placed in the same generation tier and generated with an incomplete partial record.

#### Foreign key constraints

Lectern schemas can declare foreign key constraints at the schema level (`schema.restrictions.foreignKey`). Each foreign key rule names a parent schema and maps one or more local field names to corresponding field names in the parent schema.

When generating child records, pass a `ForeignKeyPool` to `generateRecord` so that foreign key constrained fields are populated from actual parent rows rather than generated freely:

```ts
const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }, { id: 'D002' }, { id: 'D003' }]]]);
const childRecord = generateRecord(sampleSchema, { seed: 42, foreignKeyPool: pool });
// childRecord.donor_id will be one of 'D001', 'D002', or 'D003'
```

For composite foreign keys (a single rule with multiple field mappings), all local fields are drawn from the **same** randomly selected parent row, preserving relational consistency.

See the `ForeignKeyPool` type documentation below for the expected pool structure.

### Schema and Dictionary Generation

#### Unique field constraints

When a field carries `unique: true`, `generateSchemaRecords` tracks every value it has generated for that field and excludes already-seen values from subsequent draws. This ensures all generated values for that field are distinct across the full set of yielded records.

If the field's value space is exhausted (e.g. a `codeList` with five entries and six records requested), the generator yields a best-effort value that may duplicate an earlier one rather than throwing.

#### Unique key constraints

When a schema declares `restrictions.uniqueKey`, `generateSchemaRecords` tracks the composite key tuple for every record and retries generation (up to 10 times) when a collision is detected. Retry seeds are derived deterministically from the record seed and the retry count, so retries do not affect the seed sequence for non-colliding records.

`initialUniqueValues` can be used to pre-populate both trackers (for `unique` fields and `uniqueKey` tuples) when appending to an existing dataset, so the generator avoids colliding with already-written values.

#### Foreign key dependency ordering across schemas

`generateDictionaryRecords` resolves schema generation order using a topological sort on the dictionary's foreign key relationships. Parent schemas are always fully generated before any dependent child schemas begin. As each parent schema finishes, its generated records are collected into a pool that child schemas draw from to populate their foreign key fields - ensuring every child record references a value that actually exists in the parent.

Schemas with no foreign key relationships between them may appear in the same tier and are generated sequentially within that tier.

---

### API - Functions

#### `generateStringValue`

Generates a value for a `SchemaStringField`. Returns a single `string` or `undefined`, or `string[]` when the field has `isArray: true`.

The generator reads the field's restrictions (including conditional branches, resolved against the provided `record`) and produces a value satisfying all active restrictions:

- If the field is not `required` and the empty check fires (see `emptyRate`), returns `undefined`.
- If `codeList` is present, picks a random element from the list.
- If `regex` is present, generates a string matching the pattern.
- If both `codeList` and `regex` are active, filters the code list to values that also satisfy the regex; returns a failure if the intersection is empty.
- Otherwise, returns an arbitrary human-readable string.
- If `field.isArray` is `true`, returns an array of generated values. Array length is controlled by `options.arrayLength` (default 1–3).

**Parameters**

| Parameter | Type                               | Description                                         |
| --------- | ---------------------------------- | --------------------------------------------------- |
| `field`   | `SchemaStringField`                | The field definition to generate a value for.       |
| `options` | `FieldGeneratorOptions` (optional) | Seed, record context, array length, and empty rate. |

**Returns:** `FieldGeneratorResult` - success wrapping `string | string[] | undefined`, or failure with conflict details.

---

#### `generateIntegerValue`

Generates a value for a `SchemaIntegerField`. Returns a single `number` (integer) or `undefined`, or `number[]` when `isArray: true`.

- If the field is not `required` and the empty check fires (see `emptyRate`), returns `undefined`.
- If `codeList` is present, picks a random element from the list.
- If `range` is present, generates an integer within the bounds (`min`/`max`/`exclusiveMin`/`exclusiveMax`).
- If both `codeList` and `range` are active, filters the code list to values within the range; returns a failure if none qualify.
- If multiple `range` restrictions are active, they are intersected; returns a failure if the intersection is empty.
- Otherwise, returns an arbitrary integer.
- If `field.isArray` is `true`, returns an array. Length is controlled by `options.arrayLength` (default 1–3).

**Parameters**

| Parameter | Type                               | Description                                         |
| --------- | ---------------------------------- | --------------------------------------------------- |
| `field`   | `SchemaIntegerField`               | The field definition to generate a value for.       |
| `options` | `FieldGeneratorOptions` (optional) | Seed, record context, array length, and empty rate. |

**Returns:** `FieldGeneratorResult` - success wrapping `number | number[] | undefined`, or failure with conflict details.

---

#### `generateNumberValue`

Generates a value for a `SchemaNumberField`. Returns a single `number` (may be floating-point) or `undefined`, or `number[]` when `isArray: true`.

Behaviour mirrors `generateIntegerValue`. The difference is that when no `codeList` or `range` constrains the output, the generated value may be a floating-point number rather than an integer.

- If the field is not `required` and the empty check fires (see `emptyRate`), returns `undefined`.
- If `codeList` is present, picks a random element from the list.
- If `range` is present, generates a float within the bounds.
- If both `codeList` and `range` are active, filters the code list to values within the range; returns a failure if none qualify.
- If multiple `range` restrictions are active, they are intersected; returns a failure if the intersection is empty.
- Otherwise, returns an arbitrary floating-point number.
- If `field.isArray` is `true`, returns an array. Length is controlled by `options.arrayLength` (default 1–3).

**Parameters**

| Parameter | Type                               | Description                                         |
| --------- | ---------------------------------- | --------------------------------------------------- |
| `field`   | `SchemaNumberField`                | The field definition to generate a value for.       |
| `options` | `FieldGeneratorOptions` (optional) | Seed, record context, array length, and empty rate. |

**Returns:** `FieldGeneratorResult` - success wrapping `number | number[] | undefined`, or failure with conflict details.

---

#### `generateBooleanValue`

Generates a value for a `SchemaBooleanField`. Returns a single `boolean` or `undefined`, or `boolean[]` when `isArray: true`.

Returns `true` or `false` at random. If the field is not `required` and the empty check fires (see `emptyRate`), returns `undefined` instead. If `field.isArray` is `true`, returns an array. Length is controlled by `options.arrayLength` (default 1–3).

`required: true` combined with `empty: true` across the active restrictions is a conflict and produces a failure result, though a value is still generated.

**Parameters**

| Parameter | Type                               | Description                                         |
| --------- | ---------------------------------- | --------------------------------------------------- |
| `field`   | `SchemaBooleanField`               | The field definition to generate a value for.       |
| `options` | `FieldGeneratorOptions` (optional) | Seed, record context, array length, and empty rate. |

**Returns:** `FieldGeneratorResult` - success wrapping `boolean | boolean[] | undefined`, or failure if `required` and `empty` conflict.

---

#### `generateRecord`

Assembles a complete `DataRecord` for a given `Schema` by calling the appropriate field generator for each field.

Fields are generated in dependency order (see [Field dependency ordering](#field-dependency-ordering)). Each field generator receives the partial record built so far so that conditional restrictions referencing earlier fields resolve correctly.

If `options.overrides` is provided, fields with a matching key use the override value directly and are not generated. If `options.foreignKeyPool` is provided, foreign key constrained fields are populated from the pool before generation begins. Explicit overrides take priority over pool values.

If `seed` is provided, the same seed and schema always produce the same `DataRecord`. Per-field seeds are derived from the record-level seed by definition-order index in `schema.fields`, preserving seed stability even when generation order differs from definition order.

**Parameters**

| Parameter | Type                                  | Description                          |
| --------- | ------------------------------------- | ------------------------------------ |
| `schema`  | `Schema`                              | The schema to generate a record for. |
| `options` | `RecordGeneratorOptions` _(optional)_ | Generation options - see type below. |

**Returns:** `DataRecord` - a record with a value (or `undefined`) for every field in the schema.

---

#### `generateSchemaRecords`

A synchronous generator that lazily yields `DataRecord` values for a given `Schema`. Records are produced one at a time - none are buffered in memory.

Enforces `unique` field constraints by excluding already-seen values from each field generator. Enforces `uniqueKey` constraints by retrying generation (up to 10 times) with a deterministically derived seed when a composite key tuple collides.

**Parameters**

| Parameter | Type                                  | Description                                              |
| --------- | ------------------------------------- | -------------------------------------------------------- |
| `schema`  | `Schema`                              | The schema to generate records for.                      |
| `options` | `SchemaGeneratorOptions` _(optional)_ | Count, seed, foreign key pool, empty rate, initial unique values. |

**Returns:** `Generator<DataRecord>` - yields one record per iteration.

---

#### `generateDictionaryRecords`

A synchronous generator that lazily yields `DictionaryRecord` values (tagged `{ schemaName, record }` pairs) for all schemas in a dictionary that have a non-zero count.

Schemas are generated in foreign key dependency order. Parent schemas are fully generated and their records held in a pool before any child records are yielded. Child records stream out one at a time without being retained in memory.

**Parameters**

| Parameter    | Type                         | Description                                               |
| ------------ | ---------------------------- | --------------------------------------------------------- |
| `dictionary` | `Dictionary`                 | The dictionary to generate records for.                   |
| `options`    | `DictionaryGeneratorOptions` | Counts per schema, seed, and empty rate - see type below. |

**Returns:** `Generator<DictionaryRecord>` - yields one tagged record per iteration, parents before children.

---

#### `generateSchemaFile`

Generates records for a schema and writes them to a new file in the given output directory. The file is named `<schema.name>.<format>` (e.g. `donor.tsv`). Records are streamed to disk without buffering.

Fails before writing if the output directory does not exist or if the output file already exists.

**Parameters**

| Parameter   | Type                                  | Description                                                   |
| ----------- | ------------------------------------- | ------------------------------------------------------------- |
| `schema`    | `Schema`                              | The schema to generate records for.                           |
| `outputDir` | `string`                              | Path to an existing directory where the file will be written. |
| `format`    | `DataFileFormat`                      | Column delimiter format: `'tsv'` or `'csv'`.                  |
| `options`   | `SchemaGeneratorOptions` _(optional)_ | Count, seed, empty rate, and uniqueness options.              |

**Returns:** `Promise<Result<void, GenerateFileError>>` - resolves to a success result on completion, or a failure with `DIRECTORY_NOT_FOUND` or `FILE_ALREADY_EXISTS`.

---

#### `generateDictionaryFiles`

Generates records for all schemas in a dictionary with a non-zero count and writes each to a separate file in the output directory, named `<schema.name>.<format>`. Records stream to disk via the `generateDictionaryRecords` generator - parent schema records are always written before child records.

All expected output file paths are checked before any writing begins. If any file already exists or the directory is missing, the function returns a failure without creating or modifying any files.

**Parameters**

| Parameter    | Type                         | Description                                                |
| ------------ | ---------------------------- | ---------------------------------------------------------- |
| `dictionary` | `Dictionary`                 | The dictionary to generate records for.                    |
| `outputDir`  | `string`                     | Path to an existing directory where files will be written. |
| `format`     | `DataFileFormat`             | Column delimiter format: `'tsv'` or `'csv'`.               |
| `options`    | `DictionaryGeneratorOptions` | Counts per schema, seed, and empty rate - see type below.  |

**Returns:** `Promise<Result<void, GenerateFileError>>` - resolves to a success result on completion, or a failure with `DIRECTORY_NOT_FOUND` or `FILE_ALREADY_EXISTS`.

---

### API - Types

#### `FieldGenerator`

Function type for a field value generator.

```ts
type FieldGenerator<TField extends SchemaField> = (
	field: TField,
	options?: FieldGeneratorOptions,
) => FieldGeneratorResult;
```

| Type parameter | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `TField`       | The specific `SchemaField` subtype this generator handles. |

---

#### `FieldGeneratorOptions`

Options accepted by all field generator functions.

```ts
type FieldGeneratorOptions = {
	seed?: number;
	record?: DataRecord;
	arrayLength?: number | RestrictionRange;
	emptyRate?: number;
	excludeValues?: Set<DataRecordValue>;
};
```

| Property        | Type                         | Default     | Description                                                                                                                                                                                                                          |
| --------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `seed`          | `number`                     | random      | RNG seed for deterministic output. When omitted, a random seed is chosen.                                                                                                                                                            |
| `record`        | `DataRecord`                 | `{}`        | Partial record context used to resolve conditional restrictions. Fields absent from this record are treated as `undefined` during evaluation.                                                                                        |
| `arrayLength`   | `number \| RestrictionRange` | `undefined` | Controls array length for `isArray` fields. A number specifies the exact length; a `RestrictionRange` provides integer bounds to sample from. When omitted, length is chosen randomly between 1 and 3. Ignored for non-array fields. |
| `emptyRate`     | `number`                     | `0.25`      | Probability (0–1) that a non-required field returns `undefined` instead of a generated value. Values outside [0, 1] are clamped. Has no effect when the field's active restrictions include `required: true`.                        |
| `excludeValues` | `Set<DataRecordValue>`       | `undefined` | Values the generator must not produce. Used by `generateSchemaRecords` to enforce `unique` field constraints across records.                                                                                                         |

---

#### `FieldGeneratorResult`

Return type of all field generator functions.

```ts
type FieldGeneratorResult = Result<DataRecordValue, FieldGeneratorFailureData>;
```

On success, `.data` holds the generated `DataRecordValue` (which may be `undefined` when the empty check fires). On failure, `.data` contains a `FieldGeneratorFailureData` object:

```ts
type FieldGeneratorFailureData = {
	value: DataRecordValue;
	conflicts: RestrictionConflict[];
};
```

| Property    | Type                    | Description                                                              |
| ----------- | ----------------------- | ------------------------------------------------------------------------ |
| `value`     | `DataRecordValue`       | Best-effort fallback value; may not satisfy all restrictions.            |
| `conflicts` | `RestrictionConflict[]` | List of restriction pairs that could not be reconciled during reduction. |

Check `result.success` to narrow the type before accessing `.data`.

---

#### `ForeignKeyPool`

```ts
type ForeignKeyPool = Map<string, DataRecord[]>;
```

Supplies the set of valid parent rows for each foreign key relationship when generating child records.

The map is keyed by the **parent schema name** (matching `ForeignKeyRestriction.schema`). Each value is an array of partial `DataRecord` objects - one entry per available parent row.

Each partial record need only contain the fields named in the foreign key mappings' `foreign` side for the relevant rule. It does not need to be a complete record from the parent schema; any fields not referenced by foreign key mappings on the child schema are ignored.

**Example:** if the child schema has a foreign key to `"donor"` with mapping `{ local: "donor_id", foreign: "id" }`, the pool entry for `"donor"` must include at least `{ id: someValue }` for each available parent row.

For composite foreign key rules (multiple mappings in a single `ForeignKeyRestriction`), all mapped local fields are assigned from the **same** selected parent row, preserving relational consistency.

When a parent schema name has no entry in the map, fields referencing that schema are generated normally - field-level restrictions apply and no foreign key constraint is enforced.

---

#### `RecordGeneratorOptions`

Options accepted by `generateRecord`.

```ts
type RecordGeneratorOptions = {
	overrides?: DataRecord;
	seed?: number;
	foreignKeyPool?: ForeignKeyPool;
	emptyRate?: number;
	fieldExclusions?: Record<string, Set<DataRecordValue>>;
};
```

| Property          | Type                                   | Default     | Description                                                                                                                                                         |
| ----------------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overrides`       | `DataRecord`                           | `undefined` | Field values to use directly, bypassing generation. Keys not in `schema.fields` are ignored. Takes priority over `foreignKeyPool` values.                           |
| `seed`            | `number`                               | `undefined` | RNG seed for deterministic output. When omitted, output is non-deterministic.                                                                                       |
| `foreignKeyPool`  | `ForeignKeyPool`                       | `undefined` | Pool of available parent rows for foreign key constrained fields. See `ForeignKeyPool` for the expected structure.                                                           |
| `emptyRate`       | `number`                               | `0.25`      | Probability (0–1) that any non-required field is left empty (`undefined`). Passed through to each field generator unchanged. See `FieldGeneratorOptions.emptyRate`. |
| `fieldExclusions` | `Record<string, Set<DataRecordValue>>` | `undefined` | Per-field sets of values the generator must not produce. Used internally by `generateSchemaRecords` to enforce `unique` constraints.                                |

---

#### `SchemaGeneratorOptions`

Options accepted by `generateSchemaRecords` and `generateSchemaFile`.

```ts
type SchemaGeneratorOptions = {
	count: number;
	seed?: number;
	foreignKeyPool?: ForeignKeyPool;
	emptyRate?: number;
	initialUniqueValues?: {
		fields?: Record<string, DataRecordValue[]>;
		keys?: string[];
	};
};
```

| Property              | Type                 | Default      | Description                                                                                                                                                                                                                                  |
| --------------------- | -------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`               | `number`             | _(required)_ | Number of records to generate.                                                                                                                                                                                                               |
| `seed`                | `number`             | `undefined`  | RNG seed for deterministic output.                                                                                                                                                                                                           |
| `foreignKeyPool`      | `ForeignKeyPool`     | `undefined`  | Pool of available parent rows for foreign key constrained fields.                                                                                                                                                                                     |
| `emptyRate`           | `number`             | `0.25`       | Probability (0–1) that any non-required field is left empty.                                                                                                                                                                                 |
| `initialUniqueValues` | `{ fields?, keys? }` | `undefined`  | Pre-populates uniqueness trackers to avoid collisions with records already written elsewhere. `fields` maps field names to pre-seen values; `keys` is an array of pre-seen serialized `uniqueKey` tuples (`JSON.stringify(keyFieldValues)`). |

---

#### `DictionaryGeneratorOptions`

Options accepted by `generateDictionaryRecords` and `generateDictionaryFiles`.

```ts
type DictionaryGeneratorOptions = {
	counts: Record<string, number>;
	seed?: number;
	emptyRate?: number;
};
```

| Property    | Type                     | Default      | Description                                                                                        |
| ----------- | ------------------------ | ------------ | -------------------------------------------------------------------------------------------------- |
| `counts`    | `Record<string, number>` | _(required)_ | Maps schema name to the number of records to generate. Schemas with count 0 or absent are skipped. |
| `seed`      | `number`                 | `undefined`  | RNG seed for deterministic output across all generated schemas.                                    |
| `emptyRate` | `number`                 | `0.25`       | Probability (0–1) that any non-required field is left empty.                                       |

---

#### `DictionaryRecord`

The value yielded by each iteration of `generateDictionaryRecords`.

```ts
type DictionaryRecord = {
	schemaName: string;
	record: DataRecord;
};
```

| Property     | Type         | Description                                           |
| ------------ | ------------ | ----------------------------------------------------- |
| `schemaName` | `string`     | The name of the schema this record was generated for. |
| `record`     | `DataRecord` | The generated record.                                 |

---

#### `DataFileFormat`

```ts
type DataFileFormat = 'tsv' | 'csv';
```

Specifies the column delimiter used when writing data files. `'tsv'` uses tab (`\t`); `'csv'` uses comma (`,`).

---

#### `GenerateFileError`

Discriminated union of failure reasons returned by `generateSchemaFile` and `generateDictionaryFiles`.

```ts
type GenerateFileError =
	| { error: 'DIRECTORY_NOT_FOUND'; directory: string }
	| { error: 'FILE_ALREADY_EXISTS'; filePath: string };
```

| Variant               | Additional field | Description                                                                |
| --------------------- | ---------------- | -------------------------------------------------------------------------- |
| `DIRECTORY_NOT_FOUND` | `directory`      | The specified output directory does not exist.                             |
| `FILE_ALREADY_EXISTS` | `filePath`       | A file at the expected output path already exists and was not overwritten. |

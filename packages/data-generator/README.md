# Data Generator

Internal test utility package for generating data that conforms to any given Lectern Data Dictionary.

Used by `packages/validation` and other packages that need programmatically generated test data for performance and correctness testing.

This package is **private** and not published to NPM.

---

## Usage

```ts
import { generateRecord, generateTsvFile } from '@overture-stack/lectern-data-generator';
import { mySchema, parentSchema } from './fixtures/mySchema';

// Generate a single record conforming to the schema
const record = generateRecord(mySchema, { seed: 42 });

// Generate a record with a specific field value forced
const invalidRecord = generateRecord(mySchema, {
	overrides: { patientId: 'DUPLICATE-ID' },
});

// Generate a child record whose FK fields are drawn from an existing set of parent rows
const parentRows = [{ id: 'P001' }, { id: 'P002' }];
const childRecord = generateRecord(mySchema, {
	seed: 42,
	foreignKeyPool: new Map([['parent', parentRows]]),
});

// Write 10,000 records to a TSV file without buffering in memory
await generateTsvFile(mySchema, {
	count: 10_000,
	outputPath: '/tmp/test-data.tsv',
	seed: 42,
});
```

---

## API Documentation

### Table of Contents

- [Data Generator](#data-generator)
	- [Usage](#usage)
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
		- [API - Functions](#api---functions)
			- [`generateStringValue`](#generatestringvalue)
			- [`generateIntegerValue`](#generateintegervalue)
			- [`generateNumberValue`](#generatenumbervalue)
			- [`generateBooleanValue`](#generatebooleanvalue)
			- [`generateRecord`](#generaterecord)
			- [`generateTsvFile`](#generatetsvfile)
		- [API - Types](#api---types)
			- [`FieldGenerator`](#fieldgenerator)
			- [`FieldGeneratorOptions`](#fieldgeneratoroptions)
			- [`FieldGeneratorResult`](#fieldgeneratorresult)
			- [`ForeignKeyPool`](#foreignkeypool)
			- [`RecordGeneratorOptions`](#recordgeneratoroptions)
			- [`TsvGeneratorOptions`](#tsvgeneratoroptions)

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

The rate is controlled by the `emptyRate` option on `FieldGeneratorOptions` and `RecordGeneratorOptions`:

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

When generating child records, pass a `ForeignKeyPool` to `generateRecord` so that FK-constrained fields are populated from actual parent rows rather than generated freely:

```ts
const pool: ForeignKeyPool = new Map([['donor', [{ id: 'D001' }, { id: 'D002' }, { id: 'D003' }]]]);
const childRecord = generateRecord(sampleSchema, { seed: 42, foreignKeyPool: pool });
// childRecord.donor_id will be one of 'D001', 'D002', or 'D003'
```

For composite foreign keys (a single FK rule with multiple field mappings), all local fields are drawn from the **same** randomly selected parent row, preserving relational consistency.

See the `ForeignKeyPool` type documentation below for the expected pool structure.

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

If `options.overrides` is provided, fields with a matching key use the override value directly and are not generated. If `options.foreignKeyPool` is provided, FK-constrained fields are populated from the pool before generation begins. Explicit overrides take priority over pool values.

If `seed` is provided, the same seed and schema always produce the same `DataRecord`. Per-field seeds are derived from the record-level seed by definition-order index in `schema.fields`, so adding a seed-stability guarantee even when generation order differs from definition order.

**Parameters**

| Parameter | Type                                  | Description                          |
| --------- | ------------------------------------- | ------------------------------------ |
| `schema`  | `Schema`                              | The schema to generate a record for. |
| `options` | `RecordGeneratorOptions` _(optional)_ | Generation options - see type below. |

**Returns:** `DataRecord` - a record with a value (or `undefined`) for every field in the schema.

---

#### `generateTsvFile`

Writes a TSV (tab-separated values) file to `options.outputPath` containing `options.count` generated records for the given schema. Records are written incrementally to the file stream - the full dataset is never held in memory.

The header row (field names in `schema.fields` order, joined by `\t`) is written first unless `includeHeader` is explicitly `false`.

Each data row is a `\t`-joined line of serialized field values. Array field values are joined using the field's `delimiter` property (defaulting to `|` if not set). `undefined` field values serialize as an empty string.

If `seed` is provided, the RNG is seeded before the first record is generated. Each subsequent record is generated with a deterministically derived seed so the entire file is reproducible.

**Parameters**

| Parameter | Type                  | Description                          |
| --------- | --------------------- | ------------------------------------ |
| `schema`  | `Schema`              | The schema to generate records for.  |
| `options` | `TsvGeneratorOptions` | Generation options - see type below. |

**Returns:** `Promise<void>` - resolves when the file has been fully written and the stream is closed.

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
};
```

| Property      | Type                         | Default     | Description                                                                                                                                                                                                                          |
| ------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `seed`        | `number`                     | random      | RNG seed for deterministic output. When omitted, a random seed is chosen.                                                                                                                                                            |
| `record`      | `DataRecord`                 | `{}`        | Partial record context used to resolve conditional restrictions. Fields absent from this record are treated as `undefined` during evaluation.                                                                                        |
| `arrayLength` | `number \| RestrictionRange` | `undefined` | Controls array length for `isArray` fields. A number specifies the exact length; a `RestrictionRange` provides integer bounds to sample from. When omitted, length is chosen randomly between 1 and 3. Ignored for non-array fields. |
| `emptyRate`   | `number`                     | `0.25`      | Probability (0–1) that a non-required field returns `undefined` instead of a generated value. Values outside [0, 1] are clamped. Has no effect when the field's active restrictions include `required: true`.                        |

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

Supplies the set of valid parent rows for each FK relationship when generating child records.

The map is keyed by the **parent schema name** (matching `ForeignKeyRestriction.schema`). Each value is an array of partial `DataRecord` objects - one entry per available parent row.

Each partial record need only contain the fields named in the FK mappings' `foreign` side for the relevant FK rule. It does not need to be a complete record from the parent schema; any fields not referenced by FK mappings on the child schema are ignored.

**Example:** if the child schema has a FK to `"donor"` with mapping `{ local: "donor_id", foreign: "id" }`, the pool entry for `"donor"` must include at least `{ id: someValue }` for each available parent row.

For composite FK rules (multiple mappings in a single `ForeignKeyRestriction`), all mapped local fields are assigned from the **same** selected parent row, preserving relational consistency.

When a parent schema name has no entry in the map, FK fields referencing that schema are generated normally - field-level restrictions apply and no FK constraint is enforced.

---

#### `RecordGeneratorOptions`

Options accepted by `generateRecord`.

```ts
type RecordGeneratorOptions = {
	overrides?: DataRecord;
	seed?: number;
	foreignKeyPool?: ForeignKeyPool;
	emptyRate?: number;
};
```

| Property         | Type             | Default     | Description                                                                                                                                                         |
| ---------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overrides`      | `DataRecord`     | `undefined` | Field values to use directly, bypassing generation. Keys not in `schema.fields` are ignored. Takes priority over `foreignKeyPool` values.                           |
| `seed`           | `number`         | `undefined` | RNG seed for deterministic output. When omitted, output is non-deterministic.                                                                                       |
| `foreignKeyPool` | `ForeignKeyPool` | `undefined` | Pool of available parent rows for FK-constrained fields. See `ForeignKeyPool` for the expected structure.                                                           |
| `emptyRate`      | `number`         | `0.25`      | Probability (0–1) that any non-required field is left empty (`undefined`). Passed through to each field generator unchanged. See `FieldGeneratorOptions.emptyRate`. |

---

#### `TsvGeneratorOptions`

Options accepted by `generateTsvFile`.

```ts
type TsvGeneratorOptions = {
	count: number;
	outputPath: string;
	includeHeader?: boolean;
	seed?: number;
};
```

| Property        | Type      | Default      | Description                                                   |
| --------------- | --------- | ------------ | ------------------------------------------------------------- |
| `count`         | `number`  | _(required)_ | Number of data rows to generate.                              |
| `outputPath`    | `string`  | _(required)_ | Absolute or relative path where the TSV file will be written. |
| `includeHeader` | `boolean` | `true`       | Whether to write a header row as the first line.              |
| `seed`          | `number`  | `undefined`  | RNG seed for deterministic output across the entire file.     |

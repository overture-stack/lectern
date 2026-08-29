# Data Generator

Internal test utility package for generating data that conforms to any given Lectern Data Dictionary.

Used by `packages/validation` and other packages that need programmatically generated test data for performance and correctness testing.

This package is **private** and not published to NPM.

---

## Usage

```ts
import { generateRecord, generateTsvFile } from '@overture-stack/lectern-data-generator';
import { mySchema } from './fixtures/mySchema';

// Generate a single record conforming to the schema
const record = generateRecord(mySchema, { seed: 42 });

// Generate a record with a specific field value forced
const invalidRecord = generateRecord(mySchema, {
	overrides: { patientId: 'DUPLICATE-ID' },
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
		- [API — Functions](#api--functions)
			- [`generateStringValue`](#generatestringvalue)
			- [`generateIntegerValue`](#generateintegervalue)
			- [`generateNumberValue`](#generatenumbervalue)
			- [`generateBooleanValue`](#generatebooleanvalue)
			- [`generateRecord`](#generaterecord)
			- [`generateTsvFile`](#generatetsvfile)
		- [API — Types](#api--types)
			- [`FieldGenerator`](#fieldgenerator)
			- [`RecordGeneratorOptions`](#recordgeneratoroptions)
			- [`TsvGeneratorOptions`](#tsvgeneratoroptions)

---

### API — Functions

#### `generateStringValue`

Generates a single valid `string` value (or `string[]` for array fields) for a `SchemaStringField`.

The generator reads the field's non-conditional restrictions and produces a value that satisfies all of them:

- If `codeList` is present, returns a randomly selected element from the list.
- If `regex` is present, returns a string that matches the pattern.
- Otherwise, returns an arbitrary human-readable string.
- If `field.isArray` is `true`, returns an array of 1–3 generated values.

Conditional restrictions (`if/then/else` blocks) are ignored in this implementation — only the top-level restriction object is read.

**Parameters**

| Parameter | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| `field`   | `SchemaStringField` | The field definition to generate a value for. |

**Returns:** `string \| string[]` — A value or array of values valid for the given field.


#### `generateIntegerValue`

Generates a single valid `number` value (or `number[]` for array fields) representing an integer for a `SchemaIntegerField`.

- If `codeList` is present, returns a randomly selected element.
- If `range` is present, returns an integer within the specified bounds (`min`/`max`/`exclusiveMin`/`exclusiveMax`).
- Otherwise, returns an arbitrary integer.
- If `field.isArray` is `true`, returns an array of 1–3 generated values.

Conditional restrictions are ignored.

**Parameters**

| Parameter | Type                 | Description                                   |
| --------- | -------------------- | --------------------------------------------- |
| `field`   | `SchemaIntegerField` | The field definition to generate a value for. |

**Returns:** `number \| number[]` — A value or array of values valid for the given field.


#### `generateNumberValue`

Generates a single valid `number` value (or `number[]` for array fields) for a `SchemaNumberField`.

Behaviour mirrors `generateIntegerValue` but the value may be a floating-point number when no `codeList` or `range` constrains it to integers.

- If `codeList` is present, returns a randomly selected element.
- If `range` is present, returns a number within the specified bounds.
- Otherwise, returns an arbitrary floating-point number.
- If `field.isArray` is `true`, returns an array of 1–3 generated values.

Conditional restrictions are ignored.

**Parameters**

| Parameter | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| `field`   | `SchemaNumberField` | The field definition to generate a value for. |

**Returns:** `number \| number[]` — A value or array of values valid for the given field.


#### `generateBooleanValue`

Generates a single valid `boolean` value (or `boolean[]` for array fields) for a `SchemaBooleanField`.

Returns `true` or `false` randomly. If `field.isArray` is `true`, returns an array of 1–3 boolean values.

**Parameters**

| Parameter | Type                 | Description                                   |
| --------- | -------------------- | --------------------------------------------- |
| `field`   | `SchemaBooleanField` | The field definition to generate a value for. |

**Returns:** `boolean \| boolean[]` — A value or array of values valid for the given field.


#### `generateRecord`

Assembles a complete `DataRecord` for a given `Schema` by calling the appropriate field generator for each field.

Fields are generated in `schema.fields` order. After generation, any `overrides` values replace the generated values for the matching field names — this is the primary mechanism for injecting invalid or controlled values in tests.

If `seed` is provided, the RNG is seeded once before the first field is generated. The same seed always produces the same `DataRecord` for the same schema.

Conditional restrictions on individual fields are ignored during generation (the naïve first-pass implementation).

**Parameters**

| Parameter | Type                                  | Description                          |
| --------- | ------------------------------------- | ------------------------------------ |
| `schema`  | `Schema`                              | The schema to generate a record for. |
| `options` | `RecordGeneratorOptions` _(optional)_ | Generation options — see type below. |

**Returns:** `DataRecord` — A record with a value for every field in the schema.


#### `generateTsvFile`

Writes a TSV (tab-separated values) file to `options.outputPath` containing `options.count` generated records for the given schema. Records are written incrementally to the file stream — the full dataset is never held in memory.

The header row (field names in `schema.fields` order, joined by `\t`) is written first unless `includeHeader` is explicitly `false`.

Each data row is a `\t`-joined line of serialized field values. Array field values are joined using the field's `delimiter` property (defaulting to `|` if not set).

If `seed` is provided, the RNG is seeded before the first record is generated. Each subsequent record is generated with a deterministically derived seed so the entire file is reproducible.

**Parameters**

| Parameter | Type                  | Description                          |
| --------- | --------------------- | ------------------------------------ |
| `schema`  | `Schema`              | The schema to generate records for.  |
| `options` | `TsvGeneratorOptions` | Generation options — see type below. |

**Returns:** `Promise<void>` — Resolves when the file has been fully written and the stream is closed.

---

### API — Types

#### `FieldGenerator`

Function type for a field value generator.

```ts
type FieldGenerator<F, V extends DataRecordValue> = (field: F) => V;
```

| Type parameter | Constraint                | Description                                                |
| -------------- | ------------------------- | ---------------------------------------------------------- |
| `F`            | —                         | The specific `SchemaField` subtype this generator handles. |
| `V`            | `extends DataRecordValue` | The value type produced.                                   |


#### `RecordGeneratorOptions`

Options accepted by `generateRecord`.

```ts
type RecordGeneratorOptions = {
	overrides?: Partial<DataRecord>;
	seed?: number;
};
```

| Property    | Type                  | Default     | Description                                                                              |
| ----------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `overrides` | `Partial<DataRecord>` | `undefined` | Field values to force after generation. Keys not present in `schema.fields` are ignored. |
| `seed`      | `number`              | `undefined` | RNG seed for deterministic output. When omitted, output is non-deterministic.            |


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

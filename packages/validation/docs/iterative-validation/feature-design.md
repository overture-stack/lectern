# Feature Design: Streaming Validation for Large Datasets

---

## Supporting Documents

| Document | Purpose | Status |
|---|---|---|
| [Benchmark Report](./benchmark-report.md) | Reproduction and measurement of the problem | |
| [API Reference Draft](./api-reference.md) | Draft TypeScript type and function signatures | |
| [Error Type Migration Guide](./error-migration-guide.md) | Before/after for existing error consumers | |
| [Dependency Impact Map](./dependency-impact.md) | Affected packages and external consumers | |

---

## 1. Summary

The lectern `validation` package currently requires the entire dataset to be loaded into memory before validation can run. This means it is impossible to validate very large datasets using Lectern validation. This problem is made worse by the fact that records are expanded from raw TSV strings into typed JavaScript objects, so actual memory usage significantly exceeds raw file size.

This proposal introduces four new stateful validator objects that accept records one at a time, maintain lightweight internal indices, and produce a complete error report once all records have been submitted:

1. **CrossRecordValidator** - stateful; tracks `unique` and `uniqueKey` violations across submitted records. Does not validate individual records.
2. **CrossSchemaValidator** - stateful; tracks `foreignKey` violations across schemas. Does not validate individual records or uniqueness.
3. **SchemaValidator** - combines per-record validation (`validateRecord`) with cross-record validation (`CrossRecordValidator`).
4. **DictionaryValidator** - combines per-record validation, cross-record validation, and cross-schema validation (`CrossSchemaValidator`).

All four are exported so developers can use the lower-level components directly.

---

## 2. Motivation / Problem Statement

### Current Limitation

The validation functions in `@overture-stack/lectern-validation` require the entire dataset to be provided as an argument at the time of the function call. For schema-level and dictionary-level validation, this means all records across all related schemas must be fully loaded into memory before any validation can begin.

The consequence is that datasets above a certain size - determined by available application memory - cannot be validated at all. This is not a performance concern but a hard functional limit.

### Evidence

<!-- Concrete reproduction steps, observed behavior, or metrics that demonstrate the problem exists. Link to benchmark report once available. -->

See ./issue-recreation-plan.md for plan to recreate and demonstrate this issue.

### Why Existing Design Cannot Solve This Incrementally

Schema-level validation builds a hash map across all records to detect `unique` and `uniqueKey` violations. Dictionary-level validation collects sets of all field values across all schemas before testing foreign key constraints. Both of these operations are inherently dataset-wide; they cannot produce a correct result from a subset of records. There is no partial computation that can be incrementally extended without holding either the full dataset or a full dataset-sized index.

---

## 3. Goals and Non-Goals

### Goals

- **CrossRecordValidator**: a stateful object that detects `unique` and `uniqueKey` violations as records are submitted one at a time, without holding the records themselves.
- **CrossSchemaValidator**: a stateful object that detects `foreignKey` violations across schemas as records are submitted, without holding records.
- **SchemaValidator**: orchestrates per-record validation (`validateRecord`) and `CrossRecordValidator`; accepts individual records or arrays and produces a complete error report.
- **DictionaryValidator**: orchestrates per-record validation, `CrossRecordValidator`, and `CrossSchemaValidator`; routes submitted records by schema name.
- All four components exported from the package so consumers can compose them independently.
- Clear lifecycle contract for all stateful objects: construction, record submission, error retrieval, and report retrieval.
- Per-record validation errors are returned directly in the `Result` of `submit()` and are never stored internally - the caller handles or discards them.
- Cross-record (`unique`/`uniqueKey`) and cross-schema (`foreignKey`) violations are stored in the internal index and exposed via `errors()`, a generator that yields detailed error objects one at a time so the caller can handle and discard each without accumulating them all in memory.
- `report()` returns aggregate stats only: record counts, record-level error counts, and violation counts broken down by constraint type and field.
- Internal memory is bounded to the size of the cross-record index (the `DataSetHashMap`) and the cross-schema reference sets - not to error volume or record count.

### Non-Goals

- No persistence for the validators; they are intended as one-time-use and to be resolved within a single process.
- External storage backends for streaming indices (Redis, filesystem, database); in-memory only for this iteration
- Updates to the `packages/client` combined parse-and-validate functions client integration is deferred

---

## 4. Proposed Design

### 4.1 Public API Surface

Four components are exported. Developers may use any layer in isolation.

#### CrossRecordValidator

Accepts records for a single schema and tracks `unique`/`uniqueKey` state. Does not validate field or record correctness.

```ts
const crossRecordValidator = createCrossRecordValidator(schema);

// submit() returns Result<void, { reason: 'DUPLICATE_ID' | 'LOCKED' }>
// success: record was accepted and added to the index
// failure DUPLICATE_ID: the id was already seen - record is ignored
// failure LOCKED: errors() generator is active - record is ignored. No records are accepted until generator is exhausted
const result = crossRecordValidator.submit({ id, data });         // single record
const result = crossRecordValidator.submit(entries);              // Array<{ id: string; data: DataRecord }>

const report = crossRecordValidator.report();
// TestResult<{
//   recordCount: number,
//   unique: { field: string; count: number }[],
//   uniqueKey: number,
// }>
// valid() when no violations were found.
// invalid({ details }) when any unique or uniqueKey violations occurred.

// errors() returns a generator of detailed violation error objects.
// Calling errors() locks the validator - submit() returns failure LOCKED until the generator is exhausted.
const errorGenerator = crossRecordValidator.errors();
for (const error of errorGenerator) {
  handleError(error); // CrossRecordValidationError
}
// generator exhausted - validator is now unlocked, submit() accepts records again
```

Internally maintains a `DataSetHashMap` (`Map<string, string[]>`) per unique/uniqueKey rule - keys are field-value hashes, values are arrays of caller-supplied record IDs - built incrementally as records are submitted. Duplicate IDs are not processed and `submit()` returns `failure` with the duplicate ID. `report()` walks the completed map and counts violations per field (for `unique`) and total violations (for `uniqueKey`). Returns `valid()` when all counts are zero. `errors()` walks the same map and yields a detailed error object per violation; the validator is locked for the duration.

#### CrossSchemaValidator

Accepts records for multiple schemas and tracks `foreignKey` state. Does not validate field, record, or uniqueness correctness.

```ts
const crossSchemaValidator = createCrossSchemaValidator(dictionary);

// submit() returns Result<void, { reason: 'DUPLICATE_ID' | 'UNKNOWN_SCHEMA' | 'LOCKED' }>
// success: record was accepted and its FK-relevant field values added to the reference set
// failure DUPLICATE_ID: the id was already seen for this schema - record is ignored
// failure UNKNOWN_SCHEMA: schemaName is not in the dictionary - record is ignored
// failure LOCKED: errors() generator is active - record is ignored. No records are accepted until generator is exhausted
const result = crossSchemaValidator.submit(schemaName, { id, data });   // single record
const result = crossSchemaValidator.submit(schemaName, entries);        // Array<{ id: string; data: DataRecord }>

const report = crossSchemaValidator.report();
// TestResult<{
//   recordCount: number,
//   foreignKey: { schema: string; counts: { localField: string; foreignSchema: string; foreignField: string; count: number }[] }[]
// }>
// valid() when no FK violations were found.
// invalid({ details }) when any foreignKey violations occurred.

// errors() returns a generator of detailed FK violation error objects.
// Calling errors() locks the validator - submit() returns failure LOCKED until the generator is exhausted.
const errorGenerator = crossSchemaValidator.errors();
for (const error of errorGenerator) {
  handleError(error); // CrossSchemaValidationError
}
// generator exhausted - validator is now unlocked, submit() accepts records again
```

Internally maintains a `Map<string, SchemaDataReference>` (`Map<schemaName, Map<fieldName, Set<DataRecordValue>>>`) built incrementally as records are submitted. Unknown schema names and duplicate IDs are both rejected at `submit()` time via `failure`. `report()` runs `testForeignKeyRestriction` for each submitted record against the completed reference map and accumulates violation counts per FK mapping, grouped by local schema. `errors()` yields a detailed error object per FK violation; the validator is locked for the duration.

> **Open question:** `testForeignKeyRestriction` tests a record against a pre-built reference map. In streaming mode, records and reference data arrive together. The final pass over submitted records to test FK violations requires either re-streaming those records through `report()` (which reintroduces memory pressure) or holding a second copy of submitted records. This re-streaming vs. storage tradeoff must be resolved before implementation. See section 6.

#### SchemaValidator

Combines per-record validation with cross-record validation. The primary interface for schema-level streaming.

```ts
const schemaValidator = createSchemaValidator(schema);

// submit() returns Result<Array<{ id: string; errors: RecordValidationError[] }>, { reason: 'DUPLICATE_ID' | 'LOCKED' }>
// success: record(s) accepted and validated - data is an array of per-record errors (empty if all records are valid)
// failure DUPLICATE_ID: a submitted id was already seen - no records from this call are processed
// failure LOCKED: errors() generator is active - record is ignored. No records are accepted until generator is exhausted
const result = schemaValidator.submit({ id, data });   // single record
const result = schemaValidator.submit(entries);        // Array<{ id: string; data: DataRecord }>
if (result.success) {
  for (const { id, errors } of result.data) {
    handleErrors(id, errors); // errors: RecordValidationError[]
  }
}

// report() returns summary counts only - counts are maintained as running totals.
const report = schemaValidator.report();
// TestResult<{
//   recordCount: number,
//   recordErrorCount: number,         // count of records that had any field/record-level errors
//   errorCounts: {
//     unique: { field: string; count: number }[],
//     uniqueKey: number,
//   }
// }>
// valid() when recordErrorCount is 0 and all errorCounts are 0.
// invalid({ details }) when any record-level or cross-record violations occurred.

// errors() returns a generator of detailed cross-record violation error objects.
// Calling errors() locks the validator - submit() returns failure LOCKED until the generator is exhausted.
const errorGenerator = schemaValidator.errors();
for (const error of errorGenerator) {
  handleError(error); // CrossRecordValidationError
}
// generator exhausted - validator is now unlocked, submit() accepts records again
```

Per-record errors are returned directly in the `submit()` result and never stored internally. Cross-record violations are stored in the internal index and exposed via `errors()`, which yields detailed error objects one at a time. `report()` returns a `TestResult` wrapping aggregate stats: `valid()` when no violations occurred at any level, `invalid({ details })` with counts otherwise.

#### DictionaryValidator

Combines per-record validation, cross-record validation, and cross-schema validation. The primary interface for dictionary-level streaming.

```ts
const dictionaryValidator = createDictionaryValidator(dictionary);

// submit() returns Result<Array<{ id: string; errors: RecordValidationError[] }>, { reason: 'DUPLICATE_ID' | 'UNKNOWN_SCHEMA' | 'LOCKED' }>
// success: record(s) accepted and validated - data is an array of per-record errors (empty if all records are valid)
// failure DUPLICATE_ID: a submitted id was already seen for this schema - no records from this call are processed
// failure UNKNOWN_SCHEMA: schemaName is not in the dictionary - no records from this call are processed
// failure LOCKED: errors() generator is active - record is ignored. No records are accepted until generator is exhausted
const result = dictionaryValidator.submit(schemaName, { id, data });   // single record
const result = dictionaryValidator.submit(schemaName, entries);        // Array<{ id: string; data: DataRecord }>
if (result.success) {
  for (const { id, errors } of result.data) {
    handleErrors(id, errors); // errors: RecordValidationError[]
  }
}

// report() returns summary counts only - counts are maintained as running totals.
const report = dictionaryValidator.report();
// TestResult<{
//   unknownSchemaCount: number,             // count of submit() calls for unrecognized schema names
//   schemaCounts: Record<schemaName, {
//     recordCount: number,
//     recordErrorCount: number,             // count of records with any field/record-level errors
//     errorCounts: {
//       unique: { field: string; count: number }[],
//       uniqueKey: number,
//       foreignKey: { schema: string; counts: { localField: string; foreignSchema: string; foreignField: string; count: number }[] }[],
//     }
//   }>
// }>
// valid() when unknownSchemaCount is 0 and all per-schema counts are 0.
// invalid({ details }) when any violations or unknown schema submissions occurred.

// errors() returns a generator of detailed cross-record and cross-schema violation error objects.
// Calling errors() locks the validator - submit() returns failure LOCKED until the generator is exhausted.
const errorGenerator = dictionaryValidator.errors();
for (const error of errorGenerator) {
  handleError(error); // CrossRecordValidationError | CrossSchemaValidationError
}
// generator exhausted - validator is now unlocked, submit() accepts records again
```

Internally holds one `CrossRecordValidator` per schema and one shared `CrossSchemaValidator`. On `submit()`, `validateRecord` runs immediately and errors are returned directly in the result - never stored. The record is also passed to the appropriate `CrossRecordValidator` and `CrossSchemaValidator`. `report()` returns aggregate counts only. `errors()` delegates to the internal `CrossRecordValidator` instances and `CrossSchemaValidator`, yielding their detailed error objects in sequence; the validator is locked for the duration.

---

### 4.2 Lifecycle and State Contracts

All four validator objects have two states: **open** (accepting submissions) and **locked** (errors generator active). There is no finalization step.

- `submit()`, `report()`, and `errors()` are all callable at any time after construction.
- `submit()` is synchronous. It returns a `Result`: `success` with per-record error data when records are accepted, `failure` when rejected due to a duplicate ID, unknown schema name, or locked state.
- Per-record errors are returned directly in the `submit()` result and never stored internally. Once the caller discards the result, those errors are gone.
- `report()` always reflects the records submitted so far. Calling it mid-stream produces a result that is correct for the data seen to date. `report()` is never blocked by the locked state.
- `errors()` returns a synchronous generator of detailed cross-record and cross-schema violation error objects. Calling `errors()` transitions the validator to the **locked** state. Any `submit()` call while locked returns `failure` with `reason: 'LOCKED'`. Once the generator is fully exhausted, the validator transitions back to **open**. `report()` includes `recordCount` so callers can detect whether new records arrived after the last `errors()` drain and need to call `errors()` again.
- **FK completeness caveat:** `CrossSchemaValidator` and `DictionaryValidator` FK results from both `report()` and `errors()` are only meaningful once all foreign schema records have been submitted. A mid-stream call will reflect only the foreign values seen so far. This is a caller responsibility, not an API constraint.

### 4.3 Record Identity and the `matchingRecords` Field

#### Problem

`SchemaValidationRecordErrorUnique` and `SchemaValidationRecordErrorUniqueKey` both include `matchingRecords: number[]` - an array of indices into the record array passed to the batch validator. In streaming mode there is no record array, so positional indices have no meaning.

#### Solution: Caller-Provided Record IDs

`submit()` accepts entries of the shape `{ id: string; data: DataRecord }`. The `id` is a caller-supplied string that uniquely identifies the record within the submission - typically a file row number, a line offset, or any stable external identifier the caller maintains.

The `DataSetHashMap` value type changes from `number[]` to `string[]`, storing caller-supplied IDs instead of positional indices. `matchingRecords: number[]` becomes `matchingRecords: string[]` in the unique error types - a breaking change to the public types, handled in the Error Type Migration Guide.

Per-record errors returned from `submit()` include the `id` so the caller can correlate errors back to the originating record.

#### Deduplication on Repeated ID

If the same `id` is submitted more than once, `submit()` returns `failure` with `reason: 'DUPLICATE_ID'` and the record is not processed. This prevents a record from conflicting with itself in a `unique` violation check.

**The caller is responsible for ID uniqueness.** If two genuinely different records are submitted with the same ID, only the first is validated. This contract must be documented clearly for consumers.

### 4.4 Data Flow

On each `submit(record)` call to `SchemaValidator`:
1. `validateRecord(record, schema)` runs immediately. Any errors are returned in the `Result` data and never stored. The running `recordErrorCount` is incremented.
2. The record's relevant field values are hashed and inserted into the internal `DataSetHashMap`. The record itself is then discarded.

On `report()`:
1. The completed `DataSetHashMap` is walked to count violations per field (for `unique`) and total violations (for `uniqueKey`). No error objects are constructed.
2. A `TestResult` is returned: `valid()` when `recordErrorCount` is 0 and all constraint counts are 0; `invalid({ details })` with the full count breakdown otherwise.

On `errors()`:
1. The validator transitions to the **locked** state.
2. The `DataSetHashMap` is walked; for each violation, a detailed error object is constructed and yielded. Error objects are not stored - each is yielded and then eligible for garbage collection once the caller advances the generator.
3. When the generator is exhausted, the validator transitions back to **open**.

`DictionaryValidator` follows the same flow per schema, with the additional step that each submitted record's FK-referenced field values are added to the `CrossSchemaValidator`'s `SchemaDataReference` map before the record is discarded. FK violations are computed at `report()` and `errors()` time. `DictionaryValidator.errors()` yields cross-record violations (from each per-schema `CrossRecordValidator`) followed by cross-schema violations (from the shared `CrossSchemaValidator`).

> The open question in section 6 (re-streaming vs. storage for FK testing in `CrossSchemaValidator`) affects whether any record data must be retained. This section will be completed once that question is resolved.

---

## 5. Alternatives Considered

### Option A: In-Memory Representation Optimization

**Description:** 
Reduce per-record overhead by storing records in a more compact structure. For example, we could use a column-oriented storage in typed arrays, or interning repeated strings (field names stored once instead of per-record).

**Why rejected:**
This reduces the memory required to hold the dataset, but it is insufficient because it only reduces the memory used by a constant factor; memory still scales linearly with record count and large enough datasets still fail. This would be useful as a complementary improvement but not a solution on its own.

### Option B: Database-Delegated Constraint Validation

**Description:**
Unique, uniqueKey, and foreign key constraints are problems relational databases are specifically designed to solve at scale. An alternative design would export the data to temporary tables and use the database engine to validate constraints, returning results in the existing error format. This offloads the memory and compute problem entirely.

**Why rejected:**
This is not a solution that the Lectern client or validation package can provide, since they operate without a database dependency. Importantly, we want Lectern to be able to process larger datasets without requiring external software; this is important in order to keep the Lectern Client usable in the browser.

This is an approach that a submission service like Lyric would be interested in, and should be considered there.

---

## 6. Risks and Open Questions

| # | Risk / Question | Owner | Resolution |
|---|---|---|---|
| 1 | **FK testing requires re-examining submitted records at `report()` time.** `testForeignKeyRestriction` tests a record against a reference map. But records and reference data arrive interleaved during streaming - a record in schema B may arrive before all schema A records have been submitted, so the reference map is incomplete at submission time. FK violations can only be tested once the full reference map is built (i.e. at `report()`). This means either: (a) the `CrossSchemaValidator` holds a copy of every submitted record to replay them at `report()` time, reintroducing memory pressure proportional to record count; or (b) the caller is required to submit records in dependency order (all foreign schema records before all referencing schema records), allowing FK testing at submit time. Option (b) shifts burden to the caller and makes the API fragile. Option (a) is correct but undermines the memory goal for FK-heavy workloads. A third option: store only the FK-relevant field values per record (not the full record), which reduces overhead to the size of the referenced fields only. | | |
| 2 | **`matchingRecords` field semantics in streaming unique errors.** Resolved in section 4.3: `matchingRecords` becomes `string[]` of caller-supplied record IDs. Breaking change to public types; see Error Type Migration Guide. | | Resolved |

---

## 7. Compatibility and Migration

### Breaking Changes

<!-- List any changes to public API that require consumers to update their code. -->

### Affected Consumers

<!-- Which packages or external projects are affected. Reference the Dependency Impact Map. -->

### Version Bump

<!-- What semver increment is required and why. -->

---

## 8. Implementation Plan

### Phase 1: [Name]

**Scope:**
**Deliverable:**
**Dependencies:**

### Phase 2: [Name]

**Scope:**
**Deliverable:**
**Dependencies:**

### Phase 3: [Name]

**Scope:**
**Deliverable:**
**Dependencies:**

---

## 9. Testing Strategy

### New Test Infrastructure Required

<!-- Data generators, memory profiling harnesses, or other tooling needed before testing can begin. -->

### Unit Tests

<!-- What new unit tests are needed and what they cover. -->

### Integration / End-to-End Tests

<!-- How correctness will be verified against real data at scale. -->

### Correctness Invariants

<!-- Properties that must hold regardless of input ordering or size - the specification for what "correct" means for this feature. -->

---

## 10. Future Work

<!-- Explicitly scoped-out items that are acknowledged but deferred. This prevents them from being raised as blockers during review. -->

-
-
-

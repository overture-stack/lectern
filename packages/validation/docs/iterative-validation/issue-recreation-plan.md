# Issue Recreation Plan: Memory Limitation in Validation

---

## What You Need to Demonstrate

Two things must be shown clearly:

1. **The failure exists** - validation crashes or becomes inoperable at some record count
2. **Memory scales with input** - memory usage grows proportionally to record count, not arbitrarily

---

## Test Environment Setup

Each validation run executes in an isolated worker child process. Memory limits for each worker are enforced via the `--max-old-space-size` Node.js flag, set by the orchestrator when it spawns the worker. The default limit is 512 MB; this causes Node to crash with a JavaScript heap out of memory error rather than consuming unbounded system RAM.

To run with the default 512 MB worker heap limit:

```bash
cd scripts
pnpm run reproduce:validation-memory
```

To run with a larger limit (e.g. to observe performance at high record counts without OOM):

```bash
cd scripts
WORKER_HEAP_LIMIT_MB=4096 pnpm run reproduce:validation-memory
```

**Controlled variables to document:**

- Node.js version
- Worker heap limit (`WORKER_HEAP_LIMIT_MB`, default 512)
- Host machine available RAM (to confirm it is not the binding constraint)

**Reproducibility:** Because limits are passed via environment variable, any contributor can run the exact same constrained scenario without modifying source files.

---

## Reproduction Script

The reproduction script lives at `scripts/src/performance/reproduceValidationMemory.ts` and is run from the `scripts` package:

```bash
cd scripts
pnpm run reproduce:validation-memory
```

The script has two phases:

**Phase 1 — Data generation:** Generates TSV test data files to `scripts/src/performance/reproduceValidationMemory-data/` if they do not already exist. Files are checked by line count on each run; stale files are regenerated. The data directory is excluded from git.

**Phase 2 — Validation tests:** For each test case and each record count, the orchestrator spawns a worker process with a constrained heap. The worker reads the corresponding number of lines from the pre-generated file, parses the TSV into typed records, then runs the validation call. The orchestrator polls the worker's RSS memory every 50 ms during the validation phase and combines that with the worker's own post-validation heap measurement. Results are printed as a Markdown table to stdout. If a worker process is killed by OOM before completing, the orchestrator records that run as `OOM`.

---

## Test Data

Three dictionaries are used, one per test case. Each file is generated at the maximum record count and read back in slices for smaller runs.

| Case | Dictionary                    | Schema(s)                              | Max records in file         |
| ---- | ----------------------------- | -------------------------------------- | --------------------------- |
| 1    | `dictionarySimple`            | `all-types` (4 fields, no constraints) | 1,000,000                   |
| 2    | `dictionaryWideUniqueKey`     | `wide-entity` (28 fields, `uniqueKey`) | 1,000,000                   |
| 3    | `dictionaryMultiRelationship` | 7 schemas with FK chains               | up to 10,000,000 per schema |

Record counts tested per case: 100 · 1,000 · 10,000 · 50,000 · 100,000 · 250,000 · 500,000 · 1,000,000. Each run is isolated in its own worker process; an OOM in one run does not prevent subsequent runs from executing.

---

## Test Cases

**Case 1: No unique or foreign key constraints**
One schema with no `unique`, `uniqueKey`, or `foreignKey` restrictions. Field and record validation only. Establishes the memory baseline — this path holds no cross-record state and should scale with constant overhead per record.

**Case 2: Schema with a uniqueKey constraint**
One schema with `uniqueKey: ['id']`. The current batch validator (`validateSchema`) builds a `DataSetHashMap` (`Map<string, number[]>`) over the full record array before checking anything. This case demonstrates that the map grows linearly with record count and eventually exhausts heap.

**Case 3: Multiple schemas with foreign key relationships**
Seven schemas where child schemas have `foreignKey` restrictions referencing parent schemas (`program → study → cohort`, `institution → lab`, `enrollment → study + institution`, `observation → cohort`). The current batch validator (`validateDictionary`) calls `collectSchemaReferenceData` which accumulates a `Set<DataRecordValue>` for every referenced field across all records before testing constraints. This case demonstrates that the reference set grows linearly with record count across all schemas.

---

## Metrics Reported

| Metric             | Purpose                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Startup (MB)       | Worker heap at process start, before any data is loaded                                                                    |
| After Parse (MB)   | Worker heap after all records are parsed into memory                                                                       |
| Peak Validate (MB) | Maximum RSS observed during the validation call (orchestrator RSS poll + worker post-validation heap, whichever is higher) |
| Time (s)           | Wall-clock duration of the validation call                                                                                 |
| ms/record          | Per-record time; predictive model for capacity planning                                                                    |
| Errors             | Count of validation errors found in the result                                                                             |
| Status             | `OK`, `OOM`, or `PARSE_ERROR`                                                                                              |

---

## Output / Evidence Artifacts

The result table printed to stdout is the source data for the benchmark report at [benchmark-report.md](./benchmark-report.md). Copy the table there along with:

- The Node.js version and heap limit used
- The exact command run
- The error output from any OOM case

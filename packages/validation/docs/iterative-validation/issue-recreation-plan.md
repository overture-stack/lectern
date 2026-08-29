# Issue Recreation Plan: Memory Limitation in Validation

---

## What You Need to Demonstrate

Two things must be shown clearly:

1. **The failure exists** — validation crashes or becomes inoperable at some record count
2. **Memory scales with input** — memory usage grows proportionally to record count, not arbitrarily

---

## Test Environment Setup

The test application runs inside a Docker container. Node.js runs inside the container; the host machine's total RAM is not a controlled variable. Memory limits are enforced at two levels:

- **Container memory limit** — set via `docker run --memory=<N>` (or the equivalent in a Compose file). This is the hard ceiling enforced by the container runtime. If the process exceeds this, the container is OOM-killed by the OS.
- **Node.js heap limit** — set via `--max-old-space-size=<N>` passed to the node process inside the container. This causes Node to throw a JavaScript heap out of memory error before hitting the container limit, producing a more informative error than a hard kill. The Node heap limit should be set below the container memory limit to ensure a clean, observable failure.

**Controlled variables to document:**
- Docker image and Node.js version
- Container memory limit (`--memory`)
- Node.js heap limit (`--max-old-space-size`)
- Container CPU allocation (to avoid confounding slowness with memory pressure)

**Reproducibility:** Because limits are defined in code (Dockerfile and Compose configuration checked into the repo), any contributor can run the exact same constrained environment regardless of their host machine's available RAM.

---

## Test Artifacts Needed

**1. Test Dictionaries**

Three dictionaries are needed, one per performance test case (see Test Cases below). Each dictionary should have:
- A wide field count per schema (20–30 fields) — this maximises per-record object overhead
- A mix of field types (string, integer, boolean, arrays)

**2. Record Generator**

A TypeScript generator function (async generator) that produces `DataRecord` objects one at a time and yields them directly. It does not write to disk. The generator:
- Accepts a record count and the target schema as arguments
- Produces valid records that pass all constraints — the goal is to stress memory, not trigger early exits on validation errors
- Manages unique field values internally (incrementing counter, etc.) when the schema has a `unique` constraint
- Manages foreign key values internally (drawing from the parent schema's emitted key set) when the schema has a `foreignKey` constraint

There is no TSV file involved. Records are created in memory one at a time and submitted directly to the validator, which is the only way to test at scales that exceed available heap.

**3. Performance Test Suite**

Performance tests live in `packages/validation/test/performance/` alongside the existing unit tests and run via Mocha using a separate config (`packages/validation/.mocharc.perf.json`) and a dedicated npm script (`test:performance`). They use `process.memoryUsage()` and `--expose-gc` / `global.gc()` to measure heap before and after validation, and assert that peak heap stays within a defined multiple of the baseline.

These are permanent test infrastructure, not one-off scripts.

**4. Docker Configuration**

A `Dockerfile` and `docker-compose.yml` (or equivalent) that:
- Builds an image from a pinned Node.js base image
- Runs the performance test suite inside the container with `--expose-gc` and `--max-old-space-size` set
- Exposes memory and CPU limits as environment variables or Compose parameters so different scenarios can be run without modifying the Dockerfile

---

## Test Cases

Three performance test cases, each exercising a distinct memory path in the current batch validator:

**Case 1: No unique or foreign key constraints**
One schema with no `unique`, `uniqueKey`, or `foreignKey` restrictions. Field and record validation only. Establishes the memory baseline — this path holds no cross-record state and should scale with constant overhead per record.

**Case 2: Schema with a unique constraint**
One schema with at least one field marked `unique`. The current batch validator builds a `DataSetHashMap` (`Map<string, number[]>`) over the full record array before checking anything. This case demonstrates that the map grows linearly with record count and eventually exhausts heap.

**Case 3: Two schemas with a foreign key relationship**
Two schemas where schema B has a `foreignKey` restriction referencing schema A. The current batch validator calls `collectSchemaReferenceData` which accumulates a `Set<DataRecordValue>` for every referenced field across all records. This case demonstrates that the reference set grows linearly with record count across both schemas. The record generator for schema B draws its foreign key values from the set of keys emitted by the schema A generator.

---

## Metrics to Report

| Metric | Purpose |
|---|---|
| Heap before validation | Baseline after record generation begins |
| Peak heap during validation | Worst-case memory requirement |
| Memory per record (slope of scaling curve) | Predictive model for capacity planning |
| Record count at OOM (at given heap limit) | The hard limit |

---

## Output / Evidence Artifacts

- Peak heap measurements at increasing record counts for each test case (10k, 50k, 100k, 250k, 500k, 1M)
- The exact error output and `docker run` command from the OOM failure case
- The test dictionary definitions and record generator functions, checked into the repo as part of the performance test suite
- The `Dockerfile` and Compose configuration, checked into the repo so any contributor can reproduce the results

The benchmark report supporting document in [benchmark-report.md](./benchmark-report.md) is the right place to record the output of these runs.

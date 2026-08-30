# Resolving Restrictions for Field Generators

Field generators attempt to generate a value that will be valid given the restrictions defined for the field in the schema. To accomplish this, the generators act in two phases: first collecting all active restrictions from the field definition, then merging each restriction type down to a set of effective constraints used for generation.

## Phase 1 - Collecting active restrictions

A field's restrictions may be a single restriction object, an array of restriction objects, or a mix of plain and conditional objects.

Conditional restrictions (`if/then/else` blocks) are evaluated against the `record` argument passed to the generator. When a condition passes, the `then` branch is used; otherwise the `else` branch is used. Fields absent from `record` are treated as `undefined`, which typically causes an `exists: true` condition to fail and an `exists: false` condition to pass.

All active (non-conditional) restriction values are collected by type before generation begins.

## Phase 2 - Merging restrictions

Each restriction type is merged independently.

### `codeList`

Multiple code lists are intersected. The generated value is drawn from the set of elements present in every active code list.

- **No conflict:** the intersection is non-empty.
- **Conflict:** the intersection is empty. The generator returns a failure result with a best-effort value drawn from the first code list.

### `range` (integer and number fields)

Multiple ranges are intersected to produce the tightest overlapping subrange. The most restrictive bound from each side (lower and upper) is kept.

- **No conflict:** a valid subrange exists.
- **Conflict:** the merged lower bound exceeds the upper bound, or both bounds are equal but at least one is exclusive. The generator returns a failure result with a best-effort value drawn from the first range.

### `regex` (string fields)

Multiple regex patterns are combined using lookahead conjunction so that the generated string must match every pattern. This is always syntactically valid, so no conflict is reported at merge time. Patterns that are semantically incompatible (i.e. can never simultaneously match) are not detected; generation will produce a value that matches the combined expression as best it can.

### `codeList` + `range` together (integer and number fields)

When both are present, the code list is filtered to values that fall within the merged range.

- **No conflict:** at least one code list value satisfies the range.
- **Conflict:** no code list value satisfies the range. The generator returns a failure result with a best-effort value drawn from the unfiltered code list.

### `codeList` + `regex` together (string fields)

When both are present, the code list is filtered to values that match the merged regex pattern.

- **No conflict:** at least one code list value matches the pattern.
- **Conflict:** no code list value matches the pattern. The generator returns a failure result with a best-effort value drawn from the unfiltered code list.

### `required` and `empty`

These restrictions do not constrain the generated value itself. However, `required: true` combined with `empty: true` across the active restrictions is a conflict - it is impossible for a field to be both required and empty. The generator returns a failure result but still produces a value.

## Failure results

All conflicts produce a failure result rather than throwing an error. The failure includes:

- A best-effort fallback value that may not satisfy all restrictions.
- A list of conflicts, one per irreconcilable pair of restrictions, each describing the restriction type and the reason the conflict occurred.

When multiple conflicts occur on the same field (e.g. two incompatible code lists and an incompatible range), all conflicts are collected and returned together in a single failure result.

Check `result.success` to distinguish success from failure before using the result value.

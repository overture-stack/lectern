# Lectern Version 2 Changes

The release of Lectern 2.0 brings some important upgrades to the Lectern service, published tooling, and importantly the Lectern Dictionary specification. Most of these changes are backwards compatible but some breaking changes have been introduced. A section at the end describes a process for upgrading from Lectern version 1 to 2.

## Summary of Changes

### Meta-Schema Updates

- Script restrictions have been removed.
- The `unique` restriction has been moved to be a property of the field, not a restriction.
- Conditional restrictions have been added.
- Fields now accept an array of restrictions, allowing multiple regex and codeList restrictions applied to a specific field.
- Regex restrictions can be a single string or array of strings, allowing multiple regular expressions to be applied to a field's value(s).

### Lectern JS Client Updates

- The client package has been moved into the same organization as other Overture software.
  - Now published at `@overture-stack/lectern-client`.
  - Old package located at `@overturebio-stack/lectern-client` is marked as deprecated.
- API Changes
  - Processing functions renamed to match validation and parsing functions
  - Updated interface for Lectern Server REST client
  - Exposes dictionary meta-schema validation, data parsing, and data validation functions

### New Published Lectern TS Packages

- [Lectern Dictionary](../packages/dictionary/)
  - Meta-Schema for validating Lectern Dictionaries
  - Functions to calculate diffs between dictionaries
  - Functions to manage dictionary refernces
- [Lectern Validation](../packages/validation/)
  - Parse raw string values into typed data to match a Lectern Dictionary
  - Validate data using a Lectern Dictionary

## Upgrading from Lectern 1

### Lectern Server Migration

Placeholder

### Updating Lectern Dictionaries

Placeholder

### Upgrading Lectern Client

Placeholder

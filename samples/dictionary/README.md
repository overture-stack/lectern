# Sample Dictionaries

This directory contains sample Lectern dictionaries in JSON format. Each file is a valid `Dictionary` object conforming to the [Lectern Dictionary Meta-Schema](../../generated/DictionaryMetaSchema.json).

## Available Dictionaries

| File | Name | Description |
|------|------|-------------|
| `dictionary-simple.json` | `dictionary-simple` | One schema with one field of each value type (`string`, `integer`, `number`, `boolean`). No restrictions. Baseline fixture for performance tests and field-level parser sanity checks. |
| `dictionary-wide-unique-key.json` | `dictionary-wide-unique-key` | One schema with 28 fields across all four value types. The `id` field is in a `uniqueKey`. No other restrictions. Used for unique-key performance testing. |
| `dictionary-wide-conditional.json` | `dictionary-wide-conditional` | One schema with 28 fields and `id` in a `uniqueKey`. Four fields carry conditional restrictions (`if/then/else`), including one nested conditional. Used for conditional restriction performance testing. |
| `dictionary-multi-relationship.json` | `dictionary-multi-relationship` | Two schemas (`entity-a`, `entity-b`). Each has a `uniqueKey` on its `id` field. `entity-b` has a `foreignKey` pointing to `entity-a`. Used for foreign key performance testing. |
| `dictionary-cancer-genomics.json` | `dictionary-cancer-genomics` | Representative cancer genomics model with seven schemas (`donor`, `primary_diagnosis`, `specimen`, `treatment`, `follow_up`, `exposure`, `comorbidity`). Includes codeLists, regex restrictions, range restrictions, and conditional restrictions. Uses dictionary `references` to define shared values — the submitter ID regex and the tumour staging system codelist — referenced via `#/regex/submitterId` and `#/enum/tumorStagingSystem` tags. |

## Technical Notes

**These files are generated — do not edit them directly.**

Source definitions are TypeScript constants in [`scripts/src/sampleDictionaries/`](../../scripts/src/sampleDictionaries/). Each dictionary has its own subdirectory; schemas are in separate files within that directory.

To regenerate the JSON files after modifying the TypeScript source:

```bash
cd scripts
pnpm generate:samples
```

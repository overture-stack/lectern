# Lectern Scripts 

## Generate Meta Schema

Create a JSON Schema file representation of the Lectern Dictionary meta schema. This file will be created at the path [`generated/DictionaryMetaSchema.json`](../../generated/DictionaryMetaSchema.json) and is available through the github repository for reference by any users that plan to use JSON schema to validate a data dictionary schema as a valid Lectern Dictionary.

Entry point: `src/generateMetaSchema.ts`
Workspace Command: `pnpm -w generate:meta`
Local Command: `pnpm generate:meta`

## Generate Sample Dictionaries

Compile the TypeScript sample dictionary definitions into static JSON files and write them to [`samples/dictionary/`](../samples/dictionary/). Each dictionary is validated against the Lectern Dictionary Zod schema at import time; the script will fail with an error if any definition is invalid.

Entry point: `src/generateSampleDictionaries.ts`
Workspace Command: `pnpm -w generate:samples`
Local Command: `pnpm generate:samples`

Dictionary source files live in `src/sampleDictionaries/`. Each dictionary has its own subdirectory containing one file per schema and an `index.ts` that assembles the `Dictionary` object. Do not edit the generated JSON files in `samples/dictionary/` directly.


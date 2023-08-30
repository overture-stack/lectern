# Lectern Dictionary Schema and Utilities

## Schema Definition for Lectern Developers

The Lectern server uses a TypeScript native schema generated with [Zod](https://zod.dev/) that can be found in the [`./src/types/dictionaryTypes.ts`](./src/types/dictionaryTypes.ts) file. There is a custom script `npm run generate` that will regenerate the content in the `DictionaryMetaSchema.json`. The JSON Schema file is generated thanks to the libary [zod-to-JSON Schema](https://www.npmjs.com/package/zod-to-JSON Schema). 

Whenever changes are made to the Zod Schemas in `./src/types` the generation script needs to be re-run and the updated Dictionary Meta Schema committed to the repository.

If the generation script needs updating, it can be found at [`./scripts/buildMetaSchema.ts`](./scripts/buildMetaSchema.ts).

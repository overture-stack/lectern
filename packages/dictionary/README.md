# Lectern Dictionary Meta-Schema and Utilities

[![NPM Version](https://img.shields.io/npm/v/@overture-stack/lectern-dictionary?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-dictionary)

This package defines the structure of Lectern Dictionaries, including providing the TypeScript type definitions to use the dictionary in code and the schemas to validate that a given JSON object is a valid Lectern Dictionary.

The Lectern Dictionary meta-schema is formally defined in TypeScript and exported as the type `Dictionary`. This definition is created using `Zod` schemas, which are also exported from this package and available for use to confirm a given object is a valid Lectern Dictionary.

A [JSON Schema definition](https://github.com/overture-stack/lectern/blob/develop/generated/DictionaryMetaSchema.json) of the Lectern Dictionary structure is also available if you are looking for a non-TypeScript mechanism for validating Lectern Dictionaries.


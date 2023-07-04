<h1 align="center">Lectern</h1>

<p align="center">Data Dictionary Management</p>

<p align="center">
    <a href="https://github.com/overture-stack/lectern">
        <img alt="Under Development"
            title="Under Development"
            src="http://www.overture.bio/img/progress-horizontal-RC.svg" width="320" />
    </a>
</p>

## Introduction
Lectern is a web service for storing and managing data dictionaries/schemas that describe TSV files. The service is responsible for maintaining different versions of a dictionary as well as computing the diff between different versions.

The intended use of the data dictionaries is to describe the structure and validations of different TSV files of interest and to be consumed downstream by a submission system that will use the validation rules against submitted files.

## Development

### Technology
- Node.js 13.14+
- Typescript 3.5
- Express
- MongoDB

### Build & Run

Install dependencies, run tests, and build.
```node
npm i
npm run test
npm run build-ts
```

This will compile the typescript and place the output in the `dist/` directory.

To run after it is built:
```node
npm start
```

### Dictionary Meta-Schema

Lectern provides a Meta-Schema definition that describes the structure of Lectern Dictionaries, a JSON Schema formatted copy of this schema can be found at [`./generated/DictionaryMetaSchema.json`](./generated/DictionaryMetaSchema.json). This can be used for any external applications that want to validate, generate, or interact with Lectern Dictionaries.

#### Schema Definition for Lectern Developers

The Lectern server uses a TypeScript native schema generated with [Zod](https://zod.dev/) that can be found in the [`./src/types/dictionaryTypes.ts`](./src/types/dictionaryTypes.ts) file. There is a custom script `npm run build:JSON Schema` - that is also executed in the `npm run build` script - that will regenerate the content in the `DictionaryMetaSchema.json`. The JSON Schema version is generated thanks to the libary [zod-to-JSON Schema](https://www.npmjs.com/package/zod-to-JSON Schema). If the generation script needs updating, it can be found at [`./scripts/buildMetaSchema.ts`](./scripts/buildMetaSchema.ts).
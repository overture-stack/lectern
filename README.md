# Lectern - Data Dictionary Management and Validation

[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)
[<img hspace="5" src="https://img.shields.io/badge/Code%20of%20Conduct-blue?style=for-the-badge">](CODE_OF_CONDUCT.md)

Lectern is Overture's Data Dictionary Schema Manager, providing a system for defining Schemas that will validate the structured data collected by an application. The core of Lectern is a web-server application that handles storage and version management of data dictionaries. Lectern data dictionaries are collections of schemas that define the structure of tabular data files (like TSV). This application provides functionality to validate the structure of data dictionaries, maintain a list of dictionary versions, and to compute the difference between dictionary versions.

</br>

>
> <div>
> <img align="left" src="ov-logo.png" height="50"/>
> </div>
> 
> *Lectern is part of [Overture](https://www.overture.bio/), a collection of open-source software microservices used to create platforms for researchers to organize and share genomics data.*
> 
> 

## Repository Structure

This repository is organized as a monorepo using [`pnpm-workspace`](https://pnpm.io/workspaces) and [`nx`](https://nx.dev/). 

> **Note:**
> You will need to use [`pnpm`](https://pnpm.io/installation) instead of `npm` to manage dependencies in this code base. PNPM will take care of linking all modules together correctly.

### Workspace Modules

The repository is organized with the following directory structure:

```
.
├── apps/
│   └── server 
└── packages/
    ├── client
    ├── common
    ├── dictionary
    └── validation
```

The modules in the monorepo are organized into two categories:

   * __apps/__ - Standalone processes meant to be run. These are published to [ghcr.io](https://ghcr.io) as container images.
   * __packages/__ - Reusable packages shared between applications and other packages. Packages are published to [NPM](https://npmjs.com).
   * __scripts__ - Utility scripts for use within this repo.

## Component Overview

| Component | Package Name | Path | Published Location | Description |
|-----------|--------------|------|-------------------|-------------|
| [Lectern Server](apps/server/README.md) | @overture-stack/lectern-server | apps/server/ | [![Lectern GHCR Packages](https://img.shields.io/badge/GHCR-lectern-brightgreen?style=for-the-badge&logo=github)](https://github.com/overture-stack/lectern/pkgs/container/lectern) | Lectern Server web application. |
| [Lectern Client](packages/client/README.md) | @overture-stack/lectern-client | packages/client | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-client?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client) | TypeScript Client to interact with Lectern Server and Lectern data dictionaries. |
| [Lectern Dictionary](packages/dictionary/README.md) | @overture-stack/lectern-dictionary | packages/dictionary | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-dictionary?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-dictionary) | Dictionary meta-schema definition, includes TS types, and Zod schemas. |
| [Lectern Validation](packages/validation/README.md) | @overture-stack/lectern-validation | packages/validation/ | [![Lectern Validation NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-validation?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client) | Validate data using Lectern Dictionaries. |

## Development Environment

### Prerequisites

- PNPM (instead of npm)
- Node.js
- Docker (for running containers)

### Local Development

You can install all dependencies for the entire repo from the root (as defined in the `pnpm-lock.yaml`) with the command:

```bash
pnpm install
```

### Common Commands

Run these from the root directory, or if you are in a sub directory then use `pnpm -w`:

#### Build Everything
```bash
pnpm build:all
```

#### Test Everything
```bash
pnpm test:all
```

Using `nx` will ensure all local dependencies are built, in the correct sequence. For example:

```bash
pnpm nx build @overture-stack/lectern-server
pnpm nx build @overture-stack/lectern-client
```

For convenience, use short aliases:
```bash
pnpm build:client
```

## Documentation

Technical resources for those working with or contributing to the project are being updated to our [official documentation site](https://docs.overture.bio/docs/under-development/lectern/), this content can also be updated and read within the `/docs` folder of this repository.

### Meta-Schema

Lectern provides a meta-schema definition that describes the structure of Lectern Dictionaries. The generated JSON Schema formatted copy of this schema can be found at [`./generated/DictionaryMetaSchema.json`](./generated/DictionaryMetaSchema.json).

> [!NOTE]
>
> Don't manually update any files in the `./generated` path. This content is programatically generated from the source code.

## Support & Contributions

- For support, feature requests, and bug reports, please see our [Support Guide](https://docs.overture.bio/community/support).

- For detailed information on how to contribute to this project, please see our [Contributing Guide](https://docs.overture.bio/docs/contribution).

## Related Software 

The Overture Platform includes the following Overture Components:

</br>

|Software|Description|
|---|---|
|[Score](https://github.com/overture-stack/score/)| Transfer data to and from any cloud-based storage system |
|[Song](https://github.com/overture-stack/song/)| Catalog and manage metadata associated to file data spread across cloud storage systems |
|[Maestro](https://github.com/overture-stack/maestro/)| Organizing your distributed data into a centralized Elasticsearch index |
|[Arranger](https://github.com/overture-stack/arranger/)| A search API with reusable search UI components |
|[Stage](https://github.com/overture-stack/stage)| A React-based web portal scaffolding |
|[Lyric](https://github.com/overture-stack/lyric)| A model-agnostic, tabular data submission system |
|[Lectern](https://github.com/overture-stack/lectern)| Schema Manager, designed to validate, store, and manage collections of data dictionaries.  |

If you'd like to get started using our platform [check out our quickstart guides](https://docs.overture.bio/guides/getting-started)

## Funding Acknowledgement

Overture is supported by grant #U24CA253529 from the National Cancer Institute at the US National Institutes of Health, and additional funding from Genome Canada, the Canada Foundation for Innovation, the Canadian Institutes of Health Research, Canarie, and the Ontario Institute for Cancer Research.

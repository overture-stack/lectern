# Lectern - Data Dictionary Management and Validation

[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)
[<img hspace="5" src="https://img.shields.io/badge/Code%20of%20Conduct-blue?style=for-the-badge">](CODE_OF_CONDUCT.md)


Lectern is Overture's Data Dictionary Schema Manager, providing a system for defining Schemas that will validate the structured data collected by an application. The core of Lectern is a web-server application that handles storage and version management of data dictionaries. Lectern data dictionaries are collections of  schemas that define the structure of tabular data files (like TSV). This application provides functionality to validate the structure of data dictionaries, maintain a list of dictionary versions, and to compute the difference between dictionary versions.

## Repository Structure

This repository is organized as a monorepo using [`pnpm-workspace`](https://pnpm.io/workspaces) and [`nx`](https://nx.dev/). 

> **Note:**
> 
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

| Component                                           | Package Name                       | Path                               | Published Location                                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Lectern Server](apps/server/README.md)             | @overture-stack/lectern-server     | apps/server/                       | [![Lectern GHCR Packages](https://img.shields.io/badge/GHCR-lectern-brightgreen?style=for-the-badge&logo=github)](https://github.com/overture-stack/lectern/pkgs/container/lectern)                             | Lectern Server web application.                                                                                                                                                                                                                                                                   |
| [Lectern Client](packages/client/README.md)         | @overture-stack/lectern-client     | packages/client                    | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-client?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client)         | TypeScript Client to interact with Lectern Server and Lectern data dictionaries. This library provides a REST client to assist in fetching data from the Lectern server. It also exposes the functionality from the Lectern Validation library to use a Lectern data dictionary to validate data. |
| [Lectern Dictionary](packages/dictionary/README.md) |                                    | @overture-stack/lectern-dictionary | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-dictionary?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-dictionary) | Dictionary meta-schema definition, includes TS types, and Zod schemas. This also exports all utilities for getting the diff of two dictionaries.                                                                                                                                                  |
| [Lectern Validation](packages/validation/README.md) | @overture-stack/lectern-validation | packages/validation/               | [![Lectern Validation NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-client?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client)     | Validate data using Lectern Dictionaries.                                                                                                                                                                                                                                                         |

## Developer Instructions

You can install all dependencies for the entire repo from the root (as defined  the `pnpm-lock.yaml`) with the command:

`pnpm install`

Using `nx` will ensure all local dependencies are built, in the correct sequence, when building, running, or testing any of the applications and packages in the repo. To run a package.json script from any module - after installing dependencies - use a command of the form `pnpm nx <script> <package name>`. For example, to `build` the module `server` can be done with the command:

`pnpm nx build server`

This will ensure that all dependencies of `server` are built in correct order before the `server` build is run.

Note that the full name of from the package must be used for this to work, so for the client the command would be:

`pnpm nx build @overture-stack/lectern-client`

For convenience, scripts have been added to the root level [`package.json`](./package.json) to run `build` and `test` scripts for every service using short names. These follow the pattern `pnpm <build|test>:<package short name/alias>`. For example,  the same build command can be performed by:

`pnpm build:client`

To work with any module in this repository, follow the instructions in the README provide in that module's directory.

Get started by running the [Lecter Server application](apps/server/README.md).

### Common Commands

A few commonly reused scripts have been added to the root `package.json`. Run them from the root directory, or if you are in a sub directory then use `pnpm -w`.

For example, when your current working directory is not in the project root, you can still conveniently test every module in the monorepo with the command:

`pnpm -w test:all`

#### Build Everything

`pnpm build:all`

This will build all modules.

#### Test Everything

`pnpm test:all`

This will test all modules in the repo.

## Additional Content

In addition to the code for Lectern, this repository contains some useful reference material.

### Meta-Schema

Lectern provides a meta-schema definition that describes the structure of Lectern Dictionaries. The generated JSON Schema formatted copy of this schema can be found at [`./generated/DictionaryMetaSchema.json`](./generated/DictionaryMetaSchema.json).

This can be used as a programing language agnostic schema for external applications to validate Lectern Dictionaries.

> [!NOTE]
>
> Don't manually update any files in the `./generated` path. This content is programatically generated from the source code.

## Support & Contributions

We welcome community contributions! Please follow our [code of conduct](./code_of_conduct.md)

- Filing an [issue](https://github.com/overture-stack/ego/issues)
- Connect with us on [Slack](http://slack.overture.bio)
- Add or Upvote a [feature request](https://github.com/overture-stack/ego/issues?q=is%3Aopen+is%3Aissue+label%3Anew-feature)

# Lectern - Data Dictionary Management and Validation

[<img hspace="5" src="https://img.shields.io/badge/chat-on--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-gpl--v3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)
[<img hspace="5" src="https://img.shields.io/badge/Code%20of%20Conduct-2.1-blue?style=for-the-badge">](CODE_OF_CONDUCT.md)


Lectern is Overture's Data Dictionary Schema Manager, providing a system for defining Schemas that will validate the structured data collected by an applicaiton. The core of Lectern is a server application for storing and version management of data dictionaries, composed of schemas for tabular data files (like TSV). This application provides functionality to validate the structure of data dictionaries, maintain a list of dictionary versions, and to compute the difference between dictionary versions.

## Developer Instructions

This repository is organized as a monorepo using [`pnpm-workspace`](https://pnpm.io/workspaces) and [`nx`](https://nx.dev/). You will need to [use `pnpm`](https://pnpm.io/installation) instead of `npm` to manage dependencies for all modules to link correctly.

You can install all dependencies for the entire repo from the root (as defined  the `pnpm-lock.yaml`) with the command:

`pnpm install`

Using `nx` will ensure all local dependencies are built, in the correct sequence, when building, running, or testing any of the applications and packages in the repo. To run a package.json script from any module, use a command of the form `pnpm nx <script> <package name>`. For example, to build the lectern server and all its dependencies:

`pnpm nx build server`

...or to run the server with hot-reloading after rebuilding all its dependencies:

`pnpm nx debug server`

...don't forget to run the application server dependencies (MongoDB) first! See instructions for [Lectern Server](./apps/server/README.md#development).

### Common Commands

A few commonly reused scripts have been added to the root `package.json`. Run them from the root directory, or if you are in a sub directory then use `pnpm -w`.
#### Build Everything

`pnpm build:all`

This will build all modules.

#### Test Everything

`pnpm test:all`

This will test everything, building all dependencies needed to fully test.

### Monorepo Modules

This repository is split into three sections each with their own type of module:

   * __apps/__ - Standalone processes meant to be run. These are published to [ghcr.io](https://ghcr.io) as container images.
   * __libraries/__ - Interal modules shared between other apps, libraries, and packages.
   * __packages/__ - Packages published to [NPM](https://npmjs.com) meant to be imported into other TypeScript applications.
  
The following modules are included in this repo:

| Component                           | Type        | Package Name                   | Path                  | Published Location                                                       | Description                                                                                   |
| ----------------------------------- | ----------- | ------------------------------ | --------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [Lectern Server](app/server/)       | Application | server                         | apps/server/          | [GHCR](https://github.com/overture-stack/lectern/pkgs/container/lectern) | Lectern Server web application.                                                               |
| [Lectern Client](packages/client/)  | Package     | @overture-stack/lectern-client | packages/client       | [NPM](https://www.npmjs.com/package/@overturebio-stack/lectern-client)   | Client to interact with Lectern Server and perform data validation.                           |
| [common](libraries/common/) | Library     | common                     | libraries/common/ | N/A                                                                      | Non-specific but commonly reusable utilities. Includes shared Errors. |
| [dictionary](libraries/dictionary/) | Library     | dictionary                     | libraries/dictionary/ | N/A                                                                      | Dictionary meta-schema definition, includes TS types, and Zod schemas. This also exports all utilities for getting the diff of two dictionaries, and for validating data records with a Dictionary. |

## Dictionary Meta-Schema

Lectern provides a Meta-Schema definition that describes the structure of Lectern Dictionaries, a JSON Schema formatted copy of this schema can be found at [`./generated/DictionaryMetaSchema.json`](./generated/DictionaryMetaSchema.json).

This can be used as a programing language agnostic schema for external applications that want to validate, generate, or interact with Lectern Dictionaries.

## Support & Contributions

We welcome community contributions! Please follow our [code of conduct](./code_of_conduct.md)

- Filing an [issue](https://github.com/overture-stack/ego/issues)
- Connect with us on [Slack](http://slack.overture.bio)
- Add or Upvote a [feature request](https://github.com/overture-stack/ego/issues?q=is%3Aopen+is%3Aissue+label%3Anew-feature)
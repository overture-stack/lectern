# Lectern

Lectern is Overture's Data Dictionary Schema Manager, designed to validate, store, and manage collections of data dictionaries. These dictionaries define schemas that specify expected data structure and syntax for tabular (TSV) data submissions. With built-in version control capabilities, Lectern can track schema evolution and compute differences between versions, while integrating seamlessly with the Lyric data submission service.


## Key Features

- **Schema Definition:** Define comprehensive schemas specifying structure, constraints, and relationships of data elements.
- **Dictionary Management:** Maintain collections of schemas (data dictionaries) with multiple versions.
- **Version Control:** Track changes and evolution of data structures over time.
- **Difference Computation:** Compare versions to understand changes in data requirements.
- **Schema Validation:** Validate the structure and syntax of data dictionary schema against Lecterns base meta-schema.
- **Integration:** includes a RESTful API (Swagger) for integration with larger data management systems.

## System Architecture

Lectern operates as a central Dictionary Schema repository within the Overture ecosystem, providing dictionary management and validation services through its RESTful API. The service maintains schemas in a database, tracking versions and relationships between different schema elements. Lectern's schemas are primarily consumed by Lyric, which stores and uses them to validate incoming tabular data submissions. Through this integration, Lectern plays a crucial role in ensuring data quality and consistency in the Overture submission workflow.

![Submission System Architecture](./images/submission-system.svg 'Updated Overture Submission System')

## Repository Structure

The repository is organized with the following directory structure:

```
.
├── apps/
│   └── server 
└── packages/
│   ├── client
|   ├── common
|   ├── dictionary
|   └── validation
└── scripts/
```
[Click here to view the Lectern repository on GitHub](https://github.com/overture-stack/lectern)


The modules in the monorepo are organized into three categories:

   - `apps/`: Standalone processes meant to be run. These are published to [ghcr.io](https://ghcr.io) as container images.
   - `packages/`: Reusable packages shared between applications and other packages. Packages are published to [NPM](https://npmjs.com).
   - `scripts`: Utility scripts for use within this repo.

#### Lectern Components

Each component serves a specific purpose within Lectern, providing functionality for server operations, client interactions, dictionary management, and data validation. Below is a detailed breakdown of the core components:

    | Component                                           | Package Name                       | Path                               | Published Location                                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                       |
    | --------------------------------------------------- | ---------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | [Lectern Server](https://github.com/overture-stack/lectern/blob/develop/apps/server/README.md)             | @overture-stack/lectern-server     | apps/server/                       | [![Lectern GHCR Packages](https://img.shields.io/badge/GHCR-lectern-brightgreen?style=for-the-badge&logo=github)](https://github.com/overture-stack/lectern/pkgs/container/lectern)                             | Lectern Server web application.                                                                                                                                                                                                                                                                   |
    | [Lectern Client](https://github.com/overture-stack/lectern/blob/develop/packages/client/README.md)         | @overture-stack/lectern-client     | packages/client                    | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-client?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client)         | TypeScript Client to interact with Lectern Server and Lectern data dictionaries. This library provides a REST client to assist in fetching data from the Lectern server. It also exposes the functionality from the Lectern Validation library to use a Lectern data dictionary to validate data. |
    | [Lectern Dictionary](https://github.com/overture-stack/lectern/blob/develop/packages/dictionary/README.md) |                                    | @overture-stack/lectern-dictionary | [![Lectern Client NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-dictionary?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-dictionary) | Dictionary meta-schema definition, includes TS types, and Zod schemas. This also exports all utilities for getting the diff of two dictionaries.                                                                                                                                                  |
    | [Lectern Validation](https://github.com/overture-stack/lectern/blob/develop/packages/validation/README.md) | @overture-stack/lectern-validation | packages/validation/               | [![Lectern Validation NPM Package](https://img.shields.io/npm/v/@overture-stack/lectern-validation?color=%23cb3837&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@overture-stack/lectern-client)     | Validate data using Lectern Dictionaries.                                                                                                                                                                        

# Lectern Server

[<img alt="Container Registry Badge" src="https://img.shields.io/badge/GCHR.io-overture--stack%2Flectern-blue?style=for-the-badge&color=blue&cacheSeconds=0" />](https://github.com/overture-stack/lectern/pkgs/container/lectern)



Lectern Server is the standalone web service for Lectern. It provides an API to create, manage, and share Data Dictionary schemas.

## Technology

Lectern is a NodeJS service written in TypeScript. It is published as a Container on ghcr.io: [Lectern Container Registry](https://github.com/overture-stack/lectern/pkgs/container/lectern)

To run the application from source, follow the [Development](#development) instructions below.

## Development
### PNPM Monorepo Package Manager
This project uses `pnpm` instead of `npm` to facilitate a monorepo workspace.

You should install dependencies for the entire mono repo using:

```shell
pnpm install
```
### Dependencies

Lectern Server relies on a MongoDB database to store dictionaries. To get you started, we provide a docker-compose configuration that will run a new instance of MongoDB in a container at [`./docker-compose.yaml`](./docker-compose.yaml).

You can start the dependency dockers with:

```shell
docker-compose up -d
```
### Build & Run

To build the server, and all modules it depends on:

```shell
pnpm nx build server
```

To run the server as a service:

```shell
pnpm nx start server
```

### Creating Docker Image

The [Dockerfile](./Dockerfile) that defines the Lectern Server image is located here in the server module directory, but building the container must be done with the workspace root as the docker context. The [.dockerignore](../../.dockerignore) at the workspace root defines what files are included in context.

From the root of the workspace you can build the container with:

```shell
docker build --no-cache -t lectern -f apps/server/Dockerfile .
```
## Configuration

Lectern Server accepts configuration parameters through environment variables.

A template for environment variables is found at [`./.env.example`](./.env.example).

### From Source

When running from source as detailed in [Build & Run](#build--run), the applicaiton will look for a file named `.env` in your current working directory. The easiest way to manage this is to copy [`./.env.example`](./.env.example) into a new file named `.env`.

```shell
cp .env.example .env
```

The file has all the available configurations with values set to match the applications default configuration.

### From Container

When launching Lectern from container using Docker, you can pass an environment file to the container on start up by adding `--env-file path/to/file.env` to the command.

The .env file you pass to this command can follow the formatting of the template provided in [`./.env.example`](./.env.example).

### Configuration Variables

Placeholder for details.

Currently, all available configurations can be found in the example .env file: [`./.env.example`](./.env.example)


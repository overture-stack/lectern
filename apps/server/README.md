# Lectern Server

[<img alt="Container Registry Badge" src="https://img.shields.io/badge/Docker--Image-ghcr.io-blue?style=for-the-badge&color=blue&cacheSeconds=0" />](https://github.com/overture-stack/lectern/pkgs/container/lectern)
[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/develop/LICENSE)

Lectern Server is a standalone web service that provides an REST API to manage and share Data Dictionary schemas.

## Technology

Lectern Server is a NodeJS service written in TypeScript.

It is published as a container on ghcr.io: [Lectern Container Registry](https://github.com/overture-stack/lectern/pkgs/container/lectern)

## Development

### PNPM Monorepo Package Manager
This project uses `pnpm` instead of `npm` to facilitate a monorepo workspace.

You should install dependencies for the entire mono repo using:

```shell
pnpm install
```
### Dependencies

Lectern Server relies on a MongoDB database to store dictionaries. To get you started, we provide a [docker-compose configuration](./docker-compose.yaml) that will run a new instance of MongoDB in a container.

You can start the dependency dockers with (run from this directory):

```shell
docker-compose up -d
```
### Build & Run

To build the server, and all modules it depends on:

```shell
pnpm nx build server
```

To run the server:

```shell
pnpm nx start server
```

To run the server in development mode, with hot reloading and exposing the node debugger:

```shell
pnpm nx debug server
```

### Creating Docker Image

The [Dockerfile](./Dockerfile) that defines the Lectern Server image is located here in the server module directory, but building the container must be done with the workspace root as the docker context. The [.dockerignore](../../.dockerignore) at the workspace root defines which files are included in context.

From the root of the workspace you can build the container with:

```shell
docker build --no-cache -t lectern -f apps/server/Dockerfile .
```
## Configuration

Lectern Server accepts configuration parameters through environment variables.

A template for environment variables is found at [`./.env.example`](./.env.example).


### From Source

When running from source as detailed in [Build & Run](#build--run), the application will look for a file named `.env` in the `apps/server` directory. The easiest way to manage this is to copy [`apps/server/.env.example`](./.env.example) into a new file named `apps/server/.env`.

```shell
cp .env.example .env
```

The file has all the available configurations with values set to match the applications default configuration.

### From Container

When launching Lectern from container using Docker, you can pass an environment file to the container on start up by adding `--env-file path/to/file.env` to the command.

The .env file you pass to this command can follow the formatting of the template provided in [`./.env.example`](./.env.example).

### Configuration Variables

All available configurations can be found in the example .env file: [`./.env.example`](./.env.example)

| Variable Name      | Required                       | Type         | Default     | Description                                                                                                                                 |
| ------------------ | ------------------------------ | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAPI_PATH       | No                             | String       | `/api-docs` | Path to Swagger UI with API documentation.                                                                                                  |
| PORT               | No                             | Number       | `3000`      | Port Lectern Server API will listen to.                                                                                                     |
|                    |                                |              |             |                                                                                                                                             |
| AUTH_ENABLED       | No                             | Boolean      | `false`     | Set to `true` to enable Authorization restrictions on all endpoints that modify data. For more details see [Authorization](#authorization). |
| EGO_API            | When `AUTH_ENABLED` is `true`  | String (URL) | -           | URL to the EGO API root. See [Auth Configuration](#auth-configuration).                                                                     |
| SCOPE              | When `AUTH_ENABLED` is `true`  | String       | -           | Policy name to look for in JWT Scope. See [Auth Configuration](#auth-configuration).                                                        |
|                    |                                |              |             |                                                                                                                                             |
| MONGO_DB           | No                             | String       | `lectern`   | Name of Database to connect with in MongoDB                                                                                                 |
| MONGO_HOST         | No                             | String       | `localhost` | Host of MongoDB                                                                                                                             |
| MONGO_PASS         | No                             | String       | `password`  | Password used for MongoDB Connection                                                                                                        |
| MONGO_HOST         | No                             | Number       | `27017`     | Port of MongoDB                                                                                                                             |
| MONGO_USER         | No                             | String       | `admin`     | User name for MongoDB Connection                                                                                                            |
|                    |                                |              |             |                                                                                                                                             |
| VAULT_ENABLED      | No                             | Boolean      | `false`     | Set to true to enable reading secret values from Vault. See [Vault for Secret Storage](#vault-for-secret-storage).                          |
| VAULT_ROLE         | When `VAULT_ENABLED` is `true` | String       | -           | Role to use for Vault connection, needs permission to read from `VAULT_SECRETS_PATH`                                                        |
| VAULT_SECRETS_PATH | When `VAULT_ENABLED` is `true` | String       | -           | Path to location in Vault that holds Lectern relevant secrets                                                                               |
| VAULT_TOKEN        | When `VAULT_ENABLED` is `true` | String       | -           | Access Token to read from Vault using specified `VAULT_ROLE`                                                                                |

### Vault for Secret Storage

Lectern has an optional integration with [Hashicorp Vault](https://www.vaultproject.io/). If you use Vault to store configuration secrets, you can have Lectern connect to your Vault instance on startup. Some of the configuration variables will be read from Vault and used in the application config.

For Lectern Server, all MonogDB Configuration properties can be provided by Vault. If Vault is enabled, and Vault contains a secret with the same name as a MongoDB configuration variable, the secret will then be used in preference to any values provided in the Environment. This is useful for maintaing MongoDB connection details securely in Vault instead of in your deployment environment.

## Authorization

Lectern handles Authorization for protected endpoints through integration with [Overture's Ego](https://www.overture.bio/products/ego/) authorization service. Ego provides a standard OAuth2 style JWT access token for Authenticated users, and this JWT includes scopes with a list of permissions. Lectern's protected endpoints expect this JWT as a Bearer token.

When Auth is enabled in Lectern, any endpoint that modifies schema data is protected. 

To use a protected endpoint, a request must contain a valid JWT Bearer Token, validated against the Public Key of the Auth server. Lectern is expecting the content of the JWT to match Ego's User JWT structure. Importantly, there needs to be an array of permissions with the `context.scope` of the JWT. Ego permissions are structure like `<SCOPE>.<POLICY>`, and for Lectern we require the `POLICY=WRITE`. The Specific `SCOPE` would typically be `lectern` but is configurable.

If a Valid JWT is received with the expected permission then the request will be accepted.

> **Attention:**
> 
> **Auth is disabled by default**. This helps reduce obstacles when starting to use Lectern and allows it to function without a supporting Auth server.
>
> Any instance of Lectern running in a production environment should have authorization enabled.

### Auth Configuration

To enable authorization in lectern set `AUTH_ENABLED` to `true` in your environment variables.

The `EGO_API` environment variable should be set to the API route of the OAuth2 server. Following OAuth2 standards, Lectern will request the public encryption key from this server at the path `{{EGO_API}}//oauth/token/public_key`.

The `SCOPE` environment variable can be any string. Lectern will look for a permission in the JWT scope that matches the pattern `{{SCOPE}}.WRITE` in an array at the path `context.scope`.



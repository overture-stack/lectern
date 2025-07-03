# Setup

This guide provides instructions for setting up a complete development environment for Lectern, Overture's data dictionary management web server service.

## Prerequisites

Before beginning, ensure you have the following installed on your system:

- PNPM (package manager - used instead of npm)
- Node.js (v18 or higher)
- Docker (for running containerized services)

## Developer Setup

This guide will walk you through setting up a complete development environment for Lectern Server, including its complementary services.

### Setting up supporting services

Lectern Server requires a MongoDB database to store dictionaries and metadata.

1. **MongoDB Database Setup**

   Use the provided docker-compose configuration to start MongoDB:

   ```bash
   # Navigate to the server directory
   cd apps/server
   
   # Start MongoDB using docker-compose
   docker-compose up -d
   ```

   Alternatively, you can start MongoDB manually:

   ```bash
   docker run --name lectern-mongo \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     -p 27017:27017 \
     -d mongo:latest
   ```

   <details>
   <summary>**Click here for a detailed breakdown**</summary>

   This command will set up the database service for Lectern Server development as follows:

   | Service         | Port   | Description                    | Purpose in Lectern Server Development |
   | --------------- | ------ | ------------------------------ | ------------------------------------ |
   | MongoDB         | 27017  | NoSQL database for dictionary storage | Stores data dictionaries, versions, and metadata |

   - Ensure port 27017 is free on your system before starting the database.
   - The default configuration uses `admin/password` for MongoDB credentials.
   - You may need to adjust the port in the configuration file if you have conflicts with existing services.

    </details>

In the next steps, we will run a Lectern development server against these supporting services.

### Running the Development Server

1. Clone Lectern and move into its directory:

   ```bash
   git clone https://github.com/overture-stack/lectern.git
   cd lectern
   ```

2. Install all dependencies for the entire monorepo:

   ```bash
   pnpm install
   ```

3. Navigate to the server directory:

   ```bash
   cd apps/server
   ```

4. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

    :::info

    This `.env` file is preconfigured as follows for the Lectern Server environment:
   
    ```env
    # Express Configuration
    PORT=3000
    
    # Swagger Docs Config
    OPENAPI_PATH=/api-docs
    
    # Mongo Configuration
    MONGO_HOST=localhost
    MONGO_PORT=27017
    MONGO_DB=lectern
    MONGO_USER=
    MONGO_PASS=
    
    # Auth Configuration
    AUTH_ENABLED=false
    EGO_API=
    SCOPE=
    
    # CORS allowed origins can be a comma separated list of the allowed domains.
    # Leave empty to not allow any web connections (default). Use * to allow all.
    CORS_ALLOWED_ORIGINS=
    
    # Vault Configuration
    VAULT_ENABLED=false
    VAULT_URL=http://localhost:8200
    VAULT_SECRETS_PATH=/kv/lectern
    VAULT_TOKEN=00000000-0000-0000-0000-000000000000
    VAULT_ROLE=
    ```

    <details>
    <summary>**Click here for an explanation of Lectern Server environment variables**</summary>

    - **Express Configuration**
        - `PORT`: Port number for the Lectern Server web application (default: 3000)
        - `OPENAPI_PATH`: Path to Swagger UI with API documentation (default: /api-docs)

    - **MongoDB Configuration**
        - `MONGO_HOST`: MongoDB server hostname (default: localhost)
        - `MONGO_PORT`: MongoDB server port (default: 27017)
        - `MONGO_DB`: Database name to use (default: lectern)
        - `MONGO_USER`: Username for MongoDB connection (optional)
        - `MONGO_PASS`: Password for MongoDB connection (optional)

    - **Authorization** (optional)
        - `AUTH_ENABLED`: Enable/disable authorization (default: false)
        - `EGO_API`: URL to the EGO API for JWT validation
        - `SCOPE`: Policy name to look for in JWT scope
        - `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

    - **Vault Configuration** (optional)
        - `VAULT_ENABLED`: Enable/disable Vault integration (default: false)
        - `VAULT_URL`: URL to Vault server
        - `VAULT_SECRETS_PATH`: Path to secrets in Vault
        - `VAULT_TOKEN`: Access token for Vault
        - `VAULT_ROLE`: Role to use for Vault connection

    </details>

5. Build the Lectern Server and its dependencies:

   ```bash
   pnpm nx build @overture-stack/lectern-server
   # or from the server directory:
   # pnpm build
   ```

6. Start the Lectern Server development server:

   ```bash
   pnpm nx start @overture-stack/lectern-server
   # or for development mode with hot reloading:
   # pnpm nx debug server
   ```

### Verification

After installation and configuration, verify that Lectern Server is functioning correctly:

1. **Test Dictionary Management**

   - Access the API documentation at `http://localhost:3000/api-docs`
   - Try creating a new data dictionary using the REST API
   - Expected result: Should be able to create, view, and manage data dictionaries
   - Troubleshooting:
     - Check MongoDB connection and ensure database is accessible
     - Verify API endpoints are responding correctly
     - Check server logs for any validation errors

2. **Test API Endpoints**
   - Health check: `curl http://localhost:3000/health`
   - API documentation: Navigate to `http://localhost:3000/api-docs`
   - Expected result: Health endpoint should return 200 OK, Swagger docs should load

**Optional: Enabling Authorization**

For production use, you should enable authorization:

1. Set `AUTH_ENABLED=true` in your `.env` file
2. Configure `EGO_API` to point to your Ego authorization service
3. Set the appropriate `SCOPE` for your permissions

**Optional: Vault Integration**

If you use HashiCorp Vault for secret management:

1. Set `VAULT_ENABLED=true` in your `.env` file
2. Configure the Vault connection parameters
3. Lectern will read MongoDB credentials from Vault instead of environment variables

For further assistance, open an issue on [GitHub](https://github.com/overture-stack/lectern/issues).

:::warning
This guide is meant for development purposes and is not intended for production use. If you use this in any public or production environment, please implement appropriate security measures and configure your environment variables accordingly.
:::

---

## **Additional Development Commands**

### From the workspace root:
```bash
# Build Lectern Server
pnpm nx build @overture-stack/lectern-server

# Start Lectern Server
pnpm nx start @overture-stack/lectern-server

# Run in debug mode (with hot reloading)
pnpm nx debug server
```

### From the apps/server directory:
```bash
# Build
pnpm build

# Start
pnpm start

# Development mode
pnpm debug
```

### Building Docker Image:
```bash
# From workspace root
docker build --no-cache -t lectern -f apps/server/Dockerfile .
```
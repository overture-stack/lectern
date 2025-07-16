# Setup

This guide provides instructions for setting up a complete development environment for Lectern, Overture's data dictionary management web server service.

## Prerequisites

Before beginning, ensure you have the following installed on your system:

- **PNPM** (package manager - used instead of npm)
- **Node.js** (v18 or higher)
- **Docker** (for running containerized services)

## Development Environment Setup

### 1. Database Setup

Lectern requires a MongoDB database to store dictionaries and metadata. Choose one of the following setup methods:

**Option A: Using Docker Compose (Recommended)**

```bash
# Navigate to the server directory
cd apps/server

# Start MongoDB using docker-compose
docker-compose up -d
```

**Option B: Manual Docker Setup**

```bash
docker run --name lectern-mongo \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
-p 27017:27017 \
-d mongo:latest
```

   <details>
   <summary><strong>Database Service Details</strong></summary>

| Service | Port  | Description                           | Purpose                                          |
| ------- | ----- | ------------------------------------- | ------------------------------------------------ |
| MongoDB | 27017 | NoSQL database for dictionary storage | Stores data dictionaries, versions, and metadata |

**Important Notes:**

- Ensure port 27017 is available on your system
- Default credentials: `admin/password`
- Adjust port configuration if conflicts exist with other services

</details>

### 2. Server Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/overture-stack/lectern.git
   cd lectern
   ```

2. **Install Dependencies**

   ```bash
   # Install all dependencies for the entire monorepo
   pnpm install
   ```

3. **Configure Environment**

   ```bash
   cd apps/server
   cp .env.example .env
   ```

   The `.env` file comes preconfigured with development defaults:

   ```env
   # Express Configuration
   PORT=3000

   # Swagger Documentation
   OPENAPI_PATH=/api-docs

   # MongoDB Configuration
   MONGO_HOST=localhost
   MONGO_PORT=27017
   MONGO_DB=lectern
   MONGO_USER=
   MONGO_PASS=

   # Authentication (disabled by default)
   AUTH_ENABLED=false
   EGO_API=
   SCOPE=

   # CORS Configuration
   CORS_ALLOWED_ORIGINS=

   # Vault Configuration (disabled by default)
   VAULT_ENABLED=false
   VAULT_URL=http://localhost:8200
   VAULT_SECRETS_PATH=/kv/lectern
   VAULT_TOKEN=00000000-0000-0000-0000-000000000000
   VAULT_ROLE=
   ```

   <details>
   <summary><strong>Environment Variables Reference</strong></summary>

   **Express Configuration**

   - `PORT`: Server port (default: 3000)
   - `OPENAPI_PATH`: Swagger UI path (default: /api-docs)

   **MongoDB Configuration**

   - `MONGO_HOST`: Database hostname (default: localhost)
   - `MONGO_PORT`: Database port (default: 27017)
   - `MONGO_DB`: Database name (default: lectern)
   - `MONGO_USER`: Database username (optional)
   - `MONGO_PASS`: Database password (optional)

   **Authentication (Optional)**

   - `AUTH_ENABLED`: Enable JWT-based authorization (default: false)
   - `EGO_API`: EGO API URL for JWT validation
   - `SCOPE`: Required policy name in JWT scope
   - `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins

   **Vault Integration (Optional)**

   - `VAULT_ENABLED`: Enable HashiCorp Vault integration (default: false)
   - `VAULT_URL`: Vault server URL
   - `VAULT_SECRETS_PATH`: Path to secrets in Vault
   - `VAULT_TOKEN`: Vault access token
   - `VAULT_ROLE`: Vault role for authentication

   </details>

4. **Build the Application**

   ```bash
   # From workspace root
   pnpm nx build @overture-stack/lectern-server

   # Or from apps/server directory
   pnpm build
   ```

5. **Start the Development Server**

   ```bash
   # Production mode
   pnpm nx start @overture-stack/lectern-server

   # Development mode with hot reloading
   pnpm nx debug server
   ```

## Verification & Testing

### API Health Check

Verify that Lectern is running correctly:

```bash
# Health endpoint
curl http://localhost:3000/health

# Expected response: 200 OK
```

### API Documentation

Access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`

### Dictionary Management Testing

1. Navigate to the Swagger UI
2. Test creating a new data dictionary using the REST API
3. Verify dictionary creation, retrieval, and management operations

**Troubleshooting:**

- Ensure MongoDB is running and accessible
- Check server logs for validation errors
- Verify API endpoints are responding correctly

:::info Need Help?
If you encounter any issues or have questions about our API, please don't hesitate to reach out through our relevant [**community support channels**](https://docs.overture.bio/community/support).
:::

## Advanced Configuration

### Enabling Authorization

For production environments, enable JWT-based authorization:

1. Set `AUTH_ENABLED=true` in your `.env` file
2. Configure `EGO_API` to point to your Ego authorization service
3. Set the appropriate `SCOPE` for your permissions

### Vault Integration

For secure secret management using HashiCorp Vault:

1. Set `VAULT_ENABLED=true` in your `.env` file
2. Configure Vault connection parameters
3. Lectern will retrieve MongoDB credentials from Vault instead of environment variables

## Development Commands Reference

### From Workspace Root

```bash
# Build server
pnpm nx build @overture-stack/lectern-server

# Start server
pnpm nx start @overture-stack/lectern-server

# Debug mode (hot reloading)
pnpm nx debug server
```

### From apps/server Directory

```bash
# Build
pnpm build

# Start
pnpm start

# Development mode
pnpm debug
```

### Docker Operations

```bash
# Build Docker image
docker build --no-cache -t lectern -f apps/server/Dockerfile .
```

:::warning
This guide is intended for development purposes only. For production deployments, implement appropriate security measures, configure authentication, and review all environment variables for your specific use case.
:::

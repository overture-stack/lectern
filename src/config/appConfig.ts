import * as dotenv from "dotenv";
import * as vault from "../vault";

export interface AppConfig {
  // Express
  serverPort(): string;
  openApiPath(): string;

  // Mongo
  mongoHost(): string;
  mongoPort(): string;
  mongoUser(): string;
  mongoPassword(): string;
  mongoDb(): string;
}

const buildBootstrapContext = async () => {
  dotenv.config();

  const vaultEnabled = process.env.VAULT_ENABLED || false;
  let secrets: any = {};
  /** Vault */
  if (vaultEnabled) {
    if (process.env.VAULT_ENABLED && process.env.VAULT_ENABLED == "true") {
      if (!process.env.VAULT_SECRETS_PATH) {
        throw new Error("Path to secrets not specified but vault is enabled");
      }
      try {
        const secretsData = await vault.loadSecret(process.env.VAULT_SECRETS_PATH);
        secrets = JSON.parse(secretsData.content);
      } catch (err) {
        console.error(err);
        throw new Error("failed to load secrets from vault.");
      }
    }
  }

  return secrets;
};

const buildAppContext = async (secrets: any): Promise<AppConfig> => {
  const config: AppConfig = {
    serverPort(): string {
      return process.env.PORT || "3000";
    },

    openApiPath(): string {
      return process.env.OPENAPI_PATH || "/api-docs";
    },

    mongoHost(): string {
      return process.env.MONGO_HOST || "localhost";
    },

    mongoPort(): string {
      return process.env.MONGO_PORT || "27017";
    },

    mongoUser(): string {
      return process.env.MONGO_USER;
    },

    mongoPassword(): string {
      return process.env.MONGO_PASS;
    },

    mongoDb(): string {
      return process.env.MONGO_DB || "lectern";
    }
  };
  return config;
};

export const getAppConfig = async (): Promise<AppConfig> => {
  const secrets = await buildBootstrapContext();
  return buildAppContext({});
};
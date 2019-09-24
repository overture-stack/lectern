import { AppConfig } from "../config/appConfig";

/**
 * Mongo Helper functions
 */
export const constructMongoUri = (appConfig: AppConfig, { includeDb = true } = {}) => {
    const user = appConfig.mongoUser();
    const pass = appConfig.mongoPassword();
    const mongoHost = appConfig.mongoHost();
    const mongoPort = appConfig.mongoPort();
    const mongoDb = appConfig.mongoDb();

    return `mongodb://${
        user && pass
            ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
            : ""
        }${mongoHost}:${mongoPort}${includeDb ? `/${mongoDb}` : ``}${user && pass ? "?authSource=admin" : ""}`;
};

export const constructTestUri = (mongoHost: string, mongoPort: string): string => {
    return `mongodb://${mongoHost}:${mongoPort}/lectern`;
};

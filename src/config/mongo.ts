import { mongoDb, mongoHost, mongoPort, mongoPass, mongoUser } from "./serverConfig";

export const getMongoCredentials = () => {
    // Add Vault integration here later
    return { user: mongoUser, pass: mongoPass };
};

export const constructMongoUri = ({ includeDb = true } = {}) => {
    const { user, pass } = getMongoCredentials();
    return `mongodb://${
        user && pass
            ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
            : ""
        }${mongoHost}:${mongoPort}${includeDb ? `/${mongoDb}` : ``}`;
};

export const constructTestUri = (mongoHost: string, mongoPort: string): string => {
    return `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;
};

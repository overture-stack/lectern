import { mongoDb, mongoHost, mongoPass, mongoUser } from "./serverConfig";
import mongoose from "mongoose";

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
        }${mongoHost}${includeDb ? `/${mongoDb}` : ``}`;
};
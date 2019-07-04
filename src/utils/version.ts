import { MalformedVersionError } from "./errors";

export const isValidVersion = (version: string): boolean => {
    return /^[0-9]+\.[0-9]+$/.test(version);
};

export const incrementMinor = (version: string): string => {
    if (!isValidVersion(version)) throw new MalformedVersionError("Version string is malformed: " + version);
    const parts = version.split(".");
    return parts[0] + "." + (parseInt(parts[1]) + 1).toString();
};

export const incrementMajor = (version: string): string => {
    if (!isValidVersion(version)) throw new MalformedVersionError("Version string is malformed: " + version);
    const parts = version.split(".");
    return (parseInt(parts[0]) + 1).toString() + "." + parts[1];
};

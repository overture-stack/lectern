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
    return (parseInt(parts[0]) + 1).toString() + "." + "0";
};

export const isGreater = (v1: string, v2: string): boolean => {
    if (!isValidVersion(v1) || !isValidVersion(v2)) {
        new MalformedVersionError(`Cannot compare versions: ${v1} , ${v2}`);
    }

    const v1Parts = v1.split(".");
    const v2Parts = v2.split(".");

    if (parseInt(v1Parts[0]) > parseInt(v2Parts[0])) {
        return true;
    } else if (parseInt(v1Parts[0]) < parseInt(v2Parts[0])) {
        return false;
    } else {
        if (parseInt(v1Parts[1]) > parseInt(v2Parts[1])) {
            return true;
        } else {
            return false;
        }
    }
};

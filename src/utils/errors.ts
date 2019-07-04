
import { Request, Response, NextFunction } from "express";

export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Conflict";
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequest";
    }
}

export class MalformedVersionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MalformedVersion";
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InternalServer";
    }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): any => {
    if (res.headersSent) {
        return next(err);
    }

    switch (err.name) {
        case "Conflict":
            res.status(409);
            break;
        case "BadRequest":
            res.status(400);
            break;
        case "MalformedVersion":
            res.status(400);
            break;
        default:
            res.status(500);
            break;
    }
    res.send({ error: err.name, message: err.message });
};



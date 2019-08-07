
import memoize from "memoizee";
import axios from "axios";
import jwt from "jsonwebtoken";
import ms from "ms";
import { NextFunction, Request, Response, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

const getKey = memoize(
    async (egoURL: string) => {
        const response = await axios.get(egoURL);
        return response.data;
    },
    {
        maxAge: ms("1h"),
        preFetch: true,
    },
);

const verifyEgoToken = async (token: string, egoURL: string) => {
    const key = await getKey(egoURL);
    return jwt.verify(token, key);
};

export default function (egoURL: string = process.env.EGO_API, scope: string = process.env.SCOPE) {
    if (!egoURL) {
        throw new Error(
            "must provide ego url with either the `EGO_API` env variable or egoURL argument",
        );
    }

    /**
     * Decorates request handlers
     */
    return (fn: RequestHandler): RequestHandler => {

        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { authorization: authorizationHeader } = req.headers;
            const { authorization: authorizationBody }: any = req.body || {};

            const authorization = authorizationHeader || authorizationBody;
            const bearerToken: string = authorization ? authorization.split(" ")[1] : req.query.key;

            let valid = false;
            try {
                valid = !!(bearerToken && (await verifyEgoToken(bearerToken, egoURL)));
            } catch (e) {
                valid = false;
            }

            if (!valid) {
                next(new UnauthorizedError("You need to be authenticated for this request."));
            } else {
                const authToken = jwt.decode(bearerToken) as ({ [key: string]: any });
                try {
                    const scopes = authToken["scope"] as Array<string>;
                    if (scopes.includes(scope)) {
                        const routePromise = fn(req, res, next);
                        if (routePromise.catch) {
                            routePromise.catch(next);
                        }
                    } else {
                        next(new ForbiddenError("Forbidden"));
                    }
                } catch (e) {
                    next(new ForbiddenError("Forbidden"));
                }
            }
        };
    };
}
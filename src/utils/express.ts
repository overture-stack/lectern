import { RequestHandler } from 'express';
import egoRequestWrapper from '../external/ego';

/**
 * Decorator to handle errors from async express route handlers
 */
export const wrapAsync = <PathParams, ResponseBody, RequestBody, Query, Locals extends Record<string, any>>(
	fn: RequestHandler<PathParams, ResponseBody, RequestBody, Query, Locals>,
): RequestHandler<PathParams, ResponseBody, RequestBody, Query, Locals> => {
	return (req, res, next) => {
		const routePromise: any = fn(req, res, next);
		if (routePromise.catch) {
			routePromise.catch(next);
		}
	};
};

export const wrapAsyncAuth = process.env.AUTH_ENABLED === 'true' ? egoRequestWrapper() : wrapAsync;

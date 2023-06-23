import { RequestHandler } from 'express';
import ego from '../services/egoTokenService';

/**
 * Decorator to handle errors from async express route handlers
 */
export const wrapAsync = <PathParams, ResponseBody, RequestBody, Query, Locals>(
	fn: RequestHandler<PathParams, ResponseBody, RequestBody, Query, Locals>,
): RequestHandler<PathParams, ResponseBody, RequestBody, Query, Locals> => {
	return (req, res, next) => {
		const routePromise: any = fn(req, res, next);
		if (routePromise.catch) {
			routePromise.catch(next);
		}
	};
};

export const wrapAsyncAuth = process.env.AUTH_ENABLED === 'true' ? ego() : wrapAsync;

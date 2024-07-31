/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import axios from 'axios';
import { ForbiddenError, UnauthorizedError } from 'dictionary';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import memoize from 'memoizee';
import ms from 'ms';

const getKey = memoize(
	async (egoURL: string) => {
		const response = await axios.get(egoURL);
		return response.data;
	},
	{
		maxAge: ms('1h'),
		preFetch: true,
	},
);

const verifyEgoToken = async (token: string, egoURL: string) => {
	const key = await getKey(egoURL);
	return jwt.verify(token, key);
};

export default function (
	egoURL: string | undefined = process.env.EGO_API,
	scope: string | undefined = process.env.SCOPE,
) {
	if (!egoURL) {
		throw new Error('Cannot perform user Authentication, application requires `EGO_API` env variable');
	}
	if (!scope) {
		throw new Error('Cannot perform user Authentication, application requires `SCOPE` env variable');
	}

	/**
	 * Decorates request handlers
	 */
	return (fn: RequestHandler): RequestHandler => {
		return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			const { authorization: authorizationHeader } = req.headers;
			const { authorization: authorizationBody } = req.body || {};

			const authorization = authorizationHeader || authorizationBody;
			const bearerToken: string = authorization ? authorization.split(' ')[1] : req.query.key;

			let valid = false;
			try {
				valid = !!(bearerToken && (await verifyEgoToken(bearerToken, egoURL)));
			} catch (e) {
				console.error(e);
				valid = false;
			}

			if (!valid) {
				next(new UnauthorizedError('You need to be authenticated for this request.'));
			} else {
				const authToken = jwt.decode(bearerToken) as { [key: string]: any };
				try {
					const scopes = authToken['context']['scope'] as Array<string>;
					if (scopes.includes(scope)) {
						const routePromise: any = fn(req, res, next);
						if (routePromise.catch) {
							routePromise.catch(next);
						}
					} else {
						next(new ForbiddenError('Forbidden'));
					}
				} catch (e) {
					console.error(e);
					next(new ForbiddenError('Forbidden'));
				}
			}
		};
	};
}

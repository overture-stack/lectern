/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '@overture-stack/lectern-dictionary';
import logger from '../config/logger';
import { fetchUserData } from '../external/pcglAuthZClient';
import { authConfig } from '../config/authConfig';

/**
 * Admin authorization middleware
 * Fetches user data from authz and will check if user has admin groups associated with the user
 * If auth is disabled, it will skip the fetch from authz.
 * Only works with Bearer type authorization
 *
 * @returns
 */
export const authAdminMiddleware = () => {
	const { enabled } = authConfig;
	return async (req: Request, _: Response, next: NextFunction) => {
		try {
			// If auth is disabled, then skip fetching user information
			if (!enabled) {
				return next();
			}

			const token = extractAccessTokenFromHeader(req);

			if (!token) {
				throw new UnauthorizedError('Unauthorized: No access token provided');
			}

			const result = await fetchUserData(token);

			if (!result.user?.isAdmin) {
				throw new ForbiddenError('Unauthorized: You do not have access to this resource');
			}

			return next();
		} catch (error) {
			logger.error(error);
			return next(error);
		}
	};
};

/**
 *	Function that takes in request object, checks if theres an authorization header and returns its token
 *  Only works with Bearer type authorization values
 *
 * @param req Request object
 * @returns Access token or undefined depending if authorization header exists or authorization type is NOT Bearer
 */
const extractAccessTokenFromHeader = (req: Request): string | undefined => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return;
	}

	return authHeader.replace('Bearer ', '').trim();
};

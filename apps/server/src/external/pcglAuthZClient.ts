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

import { Request } from 'express';

import { InternalServerError, ForbiddenError } from '@overture-stack/lectern-dictionary';

import { UserDataResponseErrorType } from '../common/types/auth';
import { Groups, userDataResponseSchema, UserDataResponseSchemaType } from '../common/validation/auth-validation';
import { authConfig } from '../config/authConfig';
import logger from '../config/logger';
import urlJoin from 'url-join';

/**
 *  Function to perform fetch requests to AUTHZ service
 *
 * @param resource endpoint to query from authz
 * @param token authorization token
 * @param options optional additional request configurations for the fetch call
 *
 */
const fetchAuthZResource = async (resource: string, token: string, options?: RequestInit) => {
	const { AUTHZ_ENDPOINT } = authConfig;

	const url = urlJoin(AUTHZ_ENDPOINT, resource);
	const headers = new Headers({
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	});

	try {
		return await fetch(url, { headers, ...options });
	} catch (error) {
		logger.error(`Bad request: Error occurred during fetch`, error);
		throw new InternalServerError(`Bad request: Something went wrong fetching from authz service`);
	}
};

/**
 * @param token Access token from Authz
 * @returns validated object of UserDataResponse
 */
export const fetchUserData = async (token: string) => {
	const response = await fetchAuthZResource(`/user/me`, token);

	if (!response.ok) {
		const errorResponse: UserDataResponseErrorType = await response.json();

		logger.error(`Error retrieving user data.`, errorResponse);
		switch (response.status) {
			case 403:
				throw new ForbiddenError(`${errorResponse.detail}`);
			default:
				throw new InternalServerError(`Error with authz: ${errorResponse.detail}`);
		}
	}

	const result: UserDataResponseSchemaType = await response.json();

	const responseValidation = userDataResponseSchema.safeParse(result);

	if (!responseValidation.success) {
		logger.error(`Error retrieving user data.`, responseValidation.error);

		throw new InternalServerError('User object response has unexpected format');
	}

	const userTokenInfo = {
		user: {
			username: `${responseValidation.data.userinfo.pcgl_id}`,
			isAdmin: isAdmin({ groups: responseValidation.data.groups }),
			allowedWriteOrganizations: responseValidation.data.study_authorizations.editable_studies,
			groups: extractUserGroups({ groups: responseValidation.data.groups }),
		},
	};

	return userTokenInfo;
};

/**
 *	Function that takes in request object, checks if theres an authorization header and returns its token
 *  Only works with Bearer type authorization values
 *
 * @param req Request object
 * @returns Access token or undefined depending if authorization header exists or authorization type is NOT Bearer
 */
export const extractAccessTokenFromHeader = (req: Request): string | undefined => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return;
	}

	return authHeader.replace('Bearer ', '').trim();
};

/**
 * @param groups List of groups users belongs to
 * @returns boolean if user has admin group
 */
const isAdmin = ({ groups }: Groups): boolean => {
	const { AUTHZ_GROUP_ADMIN } = authConfig;

	return groups.some((val) => val.name === AUTHZ_GROUP_ADMIN);
};

/**
 * @param groups List of groups user belongs to
 * @returns array of strings with names of the groups
 */
const extractUserGroups = ({ groups }: Groups): string[] => {
	return groups.map((currentGroup) => currentGroup.name);
};

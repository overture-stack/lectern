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

import { InternalServerError, ForbiddenError, NotFoundError } from '@overture-stack/lectern-dictionary';

import { UserDataResponseErrorType } from '../common/types/auth';
import { Groups, userDataResponseSchema, UserDataResponseSchemaType } from '../common/validation/auth-validation';
import { authConfig } from '../config/authConfig';
import logger from '../config/logger';
import urlJoin from 'url-join';

let serviceToken: string | undefined = undefined;

/**
 *  Function to perform fetch requests to AUTHZ service
 *
 * @param resource endpoint to query from authz
 * @param token authorization token
 * @param options optional additional request configurations for the fetch call
 *
 */
const fetchAuthZResource = async (resource: string, token: string, options?: RequestInit) => {
	// Created this function to prevent repeat usage of try/catch
	async function fetchFromAuthZ() {
		const { AUTHZ_ENDPOINT, SERVICE_ID } = authConfig;
		const url = urlJoin(AUTHZ_ENDPOINT || '', resource);
		const headers = new Headers({
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'X-Service-ID': `${SERVICE_ID}`,
			'X-Service-Token': `${serviceToken}`,
		});

		try {
			return await fetch(url, { headers, ...options });
		} catch (error) {
			logger.error(`[AUTHZ]: Something went wrong fetching authz service. ${error}`);
			throw new InternalServerError(`Bad request: Something went wrong fetching from authz service`);
		}
	}
	const firstResponse = await fetchFromAuthZ();
	// CASE-1: Bad bearer token
	if (!firstResponse.ok && firstResponse.status === 401) {
		logger.error(`[AUTHZ]: Bearer token is invalid`);

		throw new ForbiddenError(
			'Something went wrong while verifying PCGL user account information, please try again later.',
		);
	}
	// CASE-2: Bad serviceToken
	// Trigger refresh service token and recall with the new token
	if (!firstResponse.ok && firstResponse.status === 403) {
		await refreshAuthZServiceToken();
		return await fetchFromAuthZ();
	}

	return firstResponse;
};

/**
 * Function to fetch authZ service token to append to header requirement X-Service-Token
 */
const refreshAuthZServiceToken = async () => {
	const { AUTHZ_ENDPOINT, SERVICE_ID, SERVICE_UUID } = authConfig;

	try {
		const url = urlJoin(AUTHZ_ENDPOINT || '', `/service/${SERVICE_ID}/verify`);
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				service_uuid: SERVICE_UUID,
			}),
		});
		const tokenResponse = await response.json();
		serviceToken = tokenResponse.token;
	} catch (error) {
		logger.error(`[AUTHZ]: Something went wrong fetching authz service token. ${error}`);
		throw new InternalServerError(`Bad request: Something went wrong fetching from authz service`);
	}
};

/**
 * @param token Access token from Authz
 * @returns validated object of UserDataResponse
 */
export const fetchUserData = async (token: string) => {
	// If the serviceToken doesn't exist, then call refresh service token
	if (serviceToken === undefined) {
		await refreshAuthZServiceToken();
	}
	const response = await fetchAuthZResource(`/user/me`, token);

	// This is only triggered if the second fetch from fetchAuthZResource returns an error
	if (!response.ok) {
		const errorResponse: UserDataResponseErrorType = await response.json();

		logger.error(`[AUTHZ]: Unable to verify user response from AUTHZ. ${errorResponse.error}`);

		switch (response.status) {
			case 404:
				throw new NotFoundError('This account is currently not associated within the PCGL project.');
			default:
				throw new InternalServerError(
					'Something went wrong while verifying PCGL user account information, please try again later.',
				);
		}
	}

	try {
		const result: UserDataResponseSchemaType = await response.json();
		const responseValidation = userDataResponseSchema.safeParse(result);

		if (!responseValidation.success) {
			throw new InternalServerError(`Malformed response object from AUTHZ. ${responseValidation.error}`);
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
	} catch (error) {
		logger.error(`[AUTHZ]: An error occurred with the response objected returned from authz. ${error}`);
		throw new InternalServerError('Something went wrong with the authz service');
	}
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

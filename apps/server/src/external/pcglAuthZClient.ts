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

import { Group, UserDataResponse, UserDataResponseErrorType } from '../common/types/auth';
import { userDataResponseSchema } from '../common/validation/auth-validation';
import { authConfig } from '../config/authConfig';
import logger from '../config/logger';

/**
 * @param token Access token from Authz
 * @returns validated object of UserDataResponse
 */
export const fetchUserData = async (token: string) => {
	const { AUTHZ_ENDPOINT } = authConfig;
	const url = `${AUTHZ_ENDPOINT}/user/me`;

	const headers = new Headers({
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	});

	const response = await fetch(url, { headers });

	if (!response.ok) {
		const errorResponse: UserDataResponseErrorType = await response.json();

		logger.error(`Error retrieving user data.`, errorResponse.error);
		switch (response.status) {
			case 403:
				throw new ForbiddenError(errorResponse.error);
			default:
				throw new InternalServerError(errorResponse.error);
		}
	}

	const result: UserDataResponse = await response.json();

	const responseValidation = userDataResponseSchema.safeParse(result);

	if (!responseValidation.success) {
		logger.error(`Error retrieving user data.`, responseValidation.error);

		throw new InternalServerError('The required fields groups and pcgl_id were not returned in the response object');
	}

	const userTokenInfo = {
		user: {
			username: `${responseValidation.data.userinfo.pcgl_id}`,
			isAdmin: isAdmin(responseValidation.data.groups),
			allowedWriteOrganizations: responseValidation.data.study_authorizations.editable_studies,
			groups: extractUserGroups(responseValidation.data.groups),
		},
	};

	return userTokenInfo;
};

/**
 * Simple helper function to extract access token from header
 */
export const extractAccessTokenFromHeader = (req: Request): string | undefined => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return;
	}

	return authHeader.split(' ')[1];
};

/**
 * @param groups List of groups users belongs to
 * @returns boolean if user has admin group
 */
const isAdmin = (groups: Group[]): boolean => {
	const { AUTH_GROUP_ADMIN } = authConfig;

	return groups.some((val) => val.name === AUTH_GROUP_ADMIN);
};

/**
 * @param groups List of groups user belongs to
 * @returns array of strings with names of the groups
 */
const extractUserGroups = (groups: Group[]): string[] => {
	const parsedGroups: string[] = groups.reduce((acu: string[], currentGroup) => {
		acu.push(currentGroup.name);
		return acu;
	}, []);

	return parsedGroups;
};

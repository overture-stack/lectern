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
 * */

export const ActionIDs = {
	WRITE: 'WRITE',
	READ: 'READ',
} as const;

export type ActionIDsValues = (typeof ActionIDs)[keyof typeof ActionIDs];

export type UserDataResponse = {
	emails: Email[];
	pcgl_id: string | number;
	study_authorizations: Record<string, StudyAuthorization>;
	groups: Group[];
};

export type Email = {
	address: string;
	type: string;
};

export type StudyAuthorization = {
	end_date: string;
	start_date: string;
	study_id: string;
};

export type DacAuthorization = {
	study_id: string;
	start_date: string;
	end_date: string;
};

export type StudyAuthorizations = {
	team_member: string[];
	study_curator: string[];
	dac_authorizations: DacAuthorization[];
};

export type Group = {
	id: number | string;
	description: string;
	name: string;
};

export type UserDataResponseErrorType = {
	error: string;
};

export type UserSessionExtended = {
	groups: string[];
};

/**
 * JWT Token returned by CILogon on successful authentication. Note that some
 * members may not be returned depending on the IDP used.
 */
export interface CILogonToken {
	/**
	 * Subject, the ID of the CI Logon user.
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	sub: string;

	/**
	 * Identity Provider Name
	 */
	idp_name: string;

	/**
	 * Authentication Methods Array (not returned by all IDPs)
	 * JSON array of strings that are identifiers for authentication methods used in the authentication
	 * @see: https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	amr?: string;

	/**
	 * Authentication Context Class (not returned by all IDPs)
	 * @see: https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	acr?: string;

	/**
	 * Authorized party - the party to which the ID Token was issued. If present, it MUST contain the OAuth 2.0 Client ID of this party.
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	azp?: string;

	/**
	 * eduPersonPrincipalName (returned by federated uni/college logins)
	 * @see: https://www.educause.edu/fidm/attributes & https://www.canarie.ca/identity/fim/
	 */
	eppn?: string;

	/**
	 * eduPersonTargetedID (returned by federated uni/college logins).
	 * @see: https://www.educause.edu/fidm/attributes & https://www.canarie.ca/identity/fim/
	 */
	eptid?: string;

	/**
	 * Issuer, will always be CILogon
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	iss: string;

	/**
	 * User's given name, usually the same as `name`
	 */
	given_name: string;

	/**
	 * Audience - the recipients that the JWT is intended for.
	 */
	aud: string;

	/**
	 * Time from Unix Epoch - Not valid before.
	 * @see: https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	nbf: number;

	/**
	 * The unique identifier for IDP the user used to login.
	 * Usually a URL
	 */
	idp: string;

	/**
	 * Time from Unix Epoch - When the user authenticated
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	auth_time: number;

	/**
	 * The User's name
	 */
	name: string;

	/**
	 * Time from Unix Epoch - When the token expires.
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	exp: number;

	/**
	 * The user's Family (last) name
	 */
	family_name: string;

	/**
	 * Time from Unix Epoch - When the token was issued at.
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	iat: number;

	/**
	 * Unique ID of the JWT issued.
	 * @see https://openid.net/specs/openid-connect-core-1_0-final.html#IDToken
	 */
	jti: string;

	/**
	 * User's Email -  not returned by all IDP.
	 */
	email?: string;

	/**
	 * The user's affiliated roles, not returned by all IDP (returned by federated uni/college logins).
	 *
	 * Specifies the the user in broad categories such as student, faculty, staff, alum, etc.
	 * @see: https://www.educause.edu/fidm/attributes & https://www.canarie.ca/identity/fim/
	 */
	affiliation?: string;
}

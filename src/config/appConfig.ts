/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
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

import * as dotenv from 'dotenv';
import * as vault from '../external/vault';

export interface AppConfig {
	// Express
	serverPort(): string;
	openApiPath(): string;

	// Mongo
	mongoHost(): string;
	mongoPort(): string;
	mongoUser(): string;
	mongoPassword(): string;
	mongoDb(): string;
	mongoUrl(): string; // allow overriding all the url
}

const buildBootstrapContext = async () => {
	dotenv.config();

	const vaultEnabled = process.env.VAULT_ENABLED || false;
	let secrets: any = {};
	/** Vault */
	if (vaultEnabled) {
		if (process.env.VAULT_ENABLED && process.env.VAULT_ENABLED == 'true') {
			if (!process.env.VAULT_SECRETS_PATH) {
				throw new Error('Path to secrets not specified but vault is enabled');
			}
			try {
				secrets = await vault.loadSecret(process.env.VAULT_SECRETS_PATH);
			} catch (err) {
				console.error(err);
				throw new Error('failed to load secrets from vault.');
			}
		}
	}
	return secrets;
};

const buildAppContext = async (secrets: any): Promise<AppConfig> => {
	const config: AppConfig = {
		serverPort(): string {
			return process.env.PORT || '3000';
		},

		openApiPath(): string {
			return process.env.OPENAPI_PATH || '/api-docs';
		},

		mongoHost(): string {
			return secrets.MONGO_HOST || process.env.MONGO_HOST || 'localhost';
		},

		mongoPort(): string {
			return secrets.MONGO_PORT || process.env.MONGO_PORT || '27017';
		},

		mongoUser(): string {
			return secrets.MONGO_USER || process.env.MONGO_USER;
		},

		mongoPassword(): string {
			return secrets.MONGO_PASS || process.env.MONGO_PASS;
		},

		mongoDb(): string {
			return secrets.MONGO_DB || process.env.MONGO_DB || 'lectern';
		},
		mongoUrl(): string {
			return secrets.MONGO_URL || process.env.MONGO_URL;
		},
	};
	return config;
};

export const getAppConfig = async (): Promise<AppConfig> => {
	const secrets = await buildBootstrapContext();
	return buildAppContext(secrets);
};

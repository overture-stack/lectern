/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { expect } from 'chai';
import { getAppConfig } from '../../src/config/appConfig';

describe('appConfig - corsAllowedOrigins', () => {
	let originalEnv: string | undefined;

	beforeEach(() => {
		originalEnv = process.env.CORS_ALLOWED_ORIGINS;
	});

	afterEach(() => {
		if (originalEnv === undefined) {
			delete process.env.CORS_ALLOWED_ORIGINS;
		} else {
			process.env.CORS_ALLOWED_ORIGINS = originalEnv;
		}
	});

	it('returns * when CORS_ALLOWED_ORIGINS is *', async () => {
		process.env.CORS_ALLOWED_ORIGINS = '*';
		const config = await getAppConfig();
		expect(config.corsAllowedOrigins()).to.equal('*');
	});

	it('returns an empty array when CORS_ALLOWED_ORIGINS is not set', async () => {
		delete process.env.CORS_ALLOWED_ORIGINS;
		const config = await getAppConfig();
		expect(config.corsAllowedOrigins()).to.deep.equal([]);
	});

	it('returns a trimmed array of origins when CORS_ALLOWED_ORIGINS is a comma-separated list', async () => {
		process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000, https://example.com';
		const config = await getAppConfig();
		expect(config.corsAllowedOrigins()).to.deep.equal(['http://localhost:3000', 'https://example.com']);
	});
});

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

import express, { Express } from 'express';
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';

import { AppConfig } from './config/appConfig';
import logger from './config/logger';
import * as swagger from './config/swagger.json';
import dictionaryRouter from './routers/dictionaryRouter';
import diffRouter from './routers/diffRouter';
import healthRouter from './routers/healthRouter';
import { errorHandler } from './utils/errorHandler';

const App = (config: AppConfig): Express => {
	// Create Express server with mongoConfig
	const app = express();
	const serverPort = config.serverPort();
	const openApiPath = config.openApiPath();

	app.set('port', serverPort);

	app.use(cors({ origin: config.corsAllowedOrigins() }));
	app.use(express.json({ limit: '10mb' }));
	app.use(
		express.urlencoded({
			extended: true,
		}),
	);

	// Root Handler:
	app.get('/', (_, res) => {
		const details = {
			version: process.env.npm_package_version,
			commit: process.env.COMMIT_SHA,
		};
		res.send(details);
	});
	app.use('/health', healthRouter);
	app.use('/dictionaries', dictionaryRouter);
	app.use('/diff', diffRouter);

	/**
	 * Swagger Setup
	 */
	swagger.info.version = process.env.npm_package_version || '';

	app.use(openApiPath, swaggerUi.serve, swaggerUi.setup(swagger));
	logger.info(`Access swagger docs: http://localhost:${serverPort}${openApiPath}`);

	// Error handler must be added last to capture all thrown errors.
	app.use(errorHandler);

	return app;
};

export default App;

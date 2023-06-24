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

import { Server } from 'http';
import mongoose from 'mongoose';
import App from './app';
import { setDBStatus, Status } from './app-health';
import { getAppConfig } from './config/appConfig';
import logger from './config/logger';
import { constructMongoUri } from './utils/mongo';

let server: Server;

(async () => {
	const appConfig = await getAppConfig();

	/** Mongoose setup */
	mongoose.connection.on('connecting', () => {
		logger.info('Connecting to MongoDB...');
		setDBStatus(Status.OK);
	});
	mongoose.connection.on('connected', () => {
		logger.info('...Connection Established to MongoDB');
		setDBStatus(Status.OK);
	});
	mongoose.connection.on('reconnected', () => {
		logger.info('Connection Reestablished');
		setDBStatus(Status.OK);
	});
	mongoose.connection.on('disconnected', () => {
		logger.warn('Connection Disconnected');
		setDBStatus(Status.ERROR);
	});
	mongoose.connection.on('close', () => {
		logger.warn('Connection Closed');
		setDBStatus(Status.ERROR);
	});
	mongoose.connection.on('error', (error) => {
		logger.error('MongoDB Connection Error:' + error);
		setDBStatus(Status.ERROR);
	});
	mongoose.connection.on('reconnectFailed', () => {
		logger.error('Ran out of reconnect attempts, abandoning...');
		setDBStatus(Status.ERROR);
	});

	mongoose
		.connect(constructMongoUri(appConfig), { user: appConfig.mongoUser(), pass: appConfig.mongoPassword() })
		.then(() => {
			/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
		})
		.catch((err: Error) => {
			logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err);
			process.exit();
		});

	/**
	 * Start Express server.
	 */
	const app = App(appConfig);
	server = app.listen(app.get('port'), () => {
		logger.info(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
		logger.info('Press CTRL-C to stop');
	});
})();

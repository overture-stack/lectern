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

import express, { RequestHandler, Express } from 'express';
import bodyParser from 'body-parser';
import { AppConfig } from './config/appConfig';
import * as dictionaryController from './controllers/dictionaryController';
import { errorHandler } from './utils/errors';
import * as swaggerUi from 'swagger-ui-express';
import * as swagger from './config/swagger.json';
import ego from './services/egoTokenService';
import logger from './config/logger';
import { dbHealth, Status } from './app-health';

/**
 * Decorator to handle errors from async express route handlers
 */
const wrapAsync = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    const routePromise:any = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(next);
    }
  };
};

const App = (config: AppConfig): Express => {
  /**
   * Auth Decorator
   */
  const egoDecorator = process.env.AUTH_ENABLED === 'true' ? ego() : wrapAsync;

  // Create Express server with mongoConfig
  const app = express();
  const serverPort = config.serverPort();
  const openApiPath = config.openApiPath();

  app.set('port', serverPort);

  app.use(bodyParser.json({limit: '10mb'}));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  swagger['info']['version'] = process.env.npm_package_version;
  app.use(openApiPath, swaggerUi.serve, swaggerUi.setup(swagger));

  logger.info(`OpenAPI setup... done: http://localhost:${serverPort}${openApiPath}`);

  app.get('/health', (req, res) => {
    if (dbHealth.status == Status.OK) {
      const resBody = {
        appStatus: 'Up',
        dbStatus: dbHealth.status,
      };
      return res.status(200).send(resBody);
    } else {
      const resBody = {
        appStatus: 'Error/Unknown',
        dbStatus: dbHealth.status
      };
      return res.status(500).send(resBody);
    }
  });

  app.get('/', (_, res) => {
    const details = {
      app: 'Lectern',
      version: process.env.npm_package_version,
      commit: process.env.COMMIT_SHA,
    };
    res.send(details);
  });

  app.get('/dictionaries', wrapAsync(dictionaryController.listDictionaries));
  app.post('/dictionaries', egoDecorator(dictionaryController.createDictionary));
  app.get('/dictionaries/:dictId', wrapAsync(dictionaryController.getDictionary));
  app.post('/dictionaries/:dictId/schemas', egoDecorator(dictionaryController.addSchema));
  app.put('/dictionaries/:dictId/schemas', egoDecorator(dictionaryController.updateSchema));
  app.get('/diff/', wrapAsync(dictionaryController.diffDictionaries));

  app.use(errorHandler);

  return app;
};

export default App;

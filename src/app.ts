import express, { RequestHandler, Express } from 'express';
import bodyParser from 'body-parser';
import { AppConfig } from './config/appConfig';
import * as dictionaryController from './controllers/dictionaryController';
import { errorHandler } from './utils/errors';
import * as swaggerUi from 'swagger-ui-express';
import * as swagger from './config/swagger.json';
import ego from './services/egoTokenService';
import logger from './config/logger';

/**
 * Decorator to handle errors from async express route handlers
 */
const wrapAsync = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(next);
    }
  };
};

const App = (config: AppConfig): Express => {
  /**
   * Auth Decorator
   */
  const egoDecorator = process.env.AUTH_ENABLED == 'true' ? ego() : wrapAsync;

  // Create Express server with mongoConfig
  const app = express();
  const serverPort = config.serverPort();
  const openApiPath = config.openApiPath();

  app.set('port', serverPort);

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  swagger['info']['version'] = process.env.npm_package_version;
  app.use(openApiPath, swaggerUi.serve, swaggerUi.setup(swagger));

  logger.info(`OpenAPI setup... done: http://localhost:${serverPort}${openApiPath}`);

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

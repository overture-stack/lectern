import App from './app';
import mongoose from 'mongoose';
import { constructMongoUri } from './utils/mongo';
import logger from './config/logger';
import { Server } from 'http';
import { getAppConfig } from './config/appConfig';

let server: Server;

(async () => {
  const appConfig = await getAppConfig();

  /** Mongoose setup */
  mongoose.connection.on('connecting', () => {
    logger.info('Connecting to MongoDB...');
  });
  mongoose.connection.on('connected', () => {
    logger.info('...Connection Established to MongoDB');
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('Connection Reestablished');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('Connection Disconnected');
  });
  mongoose.connection.on('close', () => {
    logger.warn('Connection Closed');
  });
  mongoose.connection.on('error', error => {
    logger.error('MongoDB Connection Error:' + error);
  });
  mongoose.connection.on('reconnectFailed', () => {
    logger.error('Ran out of reconnect attempts, abandoning...');
  });

  mongoose
    .connect(constructMongoUri(appConfig), {
      autoReconnect: true,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 30000,
      keepAlive: true,
      reconnectTries: 10,
      reconnectInterval: 3000,
      useNewUrlParser: true,
    })
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

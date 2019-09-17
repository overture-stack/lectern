import express, { RequestHandler } from "express";
import bodyParser from "body-parser";
import { serverPort } from "./config/serverConfig";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors";
import * as swaggerUi from "swagger-ui-express";
import * as swagger from "./config/swagger.json";
import ego from "./services/egoTokenService";
import logger from "./config/logger";


/**
 * Decorator to handle errors from async express route handlers
 */
export const wrapAsync = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
          routePromise.catch(next);
      }
  };
};

/**
 * Auth Decorator
 */
const egoDecorator = process.env.AUTH_ENABLED == "true" ? ego() : wrapAsync ;

// Create Express server with mongoConfig
const app = express();

app.set("port", serverPort);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

swagger["info"]["version"] = process.env.npm_package_version;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

logger.info("Swagger setup... done");

app.get("/", (_, res) => {
  const details = {
    "app": "Lectern",
    "version": process.env.npm_package_version,
    "commit": process.env.COMMIT_SHA
  };
  res.send(details);
});


app.get("/dictionaries", wrapAsync(dictionaryController.listDictionaries));
app.post("/dictionaries", egoDecorator(dictionaryController.createDictionary));
app.get("/dictionaries/:dictId", wrapAsync(dictionaryController.getDictionary));
app.post("/dictionaries/:dictId/schemas", egoDecorator(dictionaryController.addSchema));
app.put("/dictionaries/:dictId/schemas", egoDecorator(dictionaryController.updateSchema));
app.get("/diff/", wrapAsync(dictionaryController.diffDictionaries));

app.use(errorHandler);

export default app;

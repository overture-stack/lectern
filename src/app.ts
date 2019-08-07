import express, { RequestHandler } from "express";
import bodyParser from "body-parser";
import { serverPort } from "./config/serverConfig";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors";
import * as swaggerUi from "swagger-ui-express";
import * as sagger from "./config/swagger.json";
import ego from "./services/egoTokenService";


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
const egoDecorator = ego();

// Create Express server with mongoConfig
const app = express();

app.set("port", serverPort);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(sagger));

app.get("/", (_, res) => res.send("Lectern"));
app.get("/dictionaries", wrapAsync(dictionaryController.listDictionaries));
app.post("/dictionaries", egoDecorator(dictionaryController.createDictionary));
app.get("/dictionaries/:dictId", wrapAsync(dictionaryController.getDictionary));
app.post("/dictionaries/:dictId/schemas", egoDecorator(dictionaryController.addSchema));
app.put("/dictionaries/:dictId/schemas", egoDecorator(dictionaryController.updateSchema));
app.get("/diff/", wrapAsync(dictionaryController.diffDictionaries));

app.use(errorHandler);

export default app;

import express from "express";
import bodyParser from "body-parser";
import { serverPort } from "./config/serverConfig";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors";
import * as swaggerUi from "swagger-ui-express";
import * as sagger from "./config/swagger.json";

// Create Express server with mongoConfig
const app = express();

app.set("port", serverPort);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(sagger));

app.get("/", (_, res) => res.send("Lectern"));
app.get("/dictionaries", dictionaryController.listDictionaries);
app.post("/dictionaries", dictionaryController.createDictionary);
app.get("/dictionaries/:dictId", dictionaryController.getDictionary);
app.post("/dictionaries/:dictId/files", dictionaryController.addFile);
app.put("/dictionaries/:dictId/files", dictionaryController.updateFile);
app.get("/diff/", dictionaryController.diffDictionaries);

app.use(errorHandler);

export default app;

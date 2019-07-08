import express from "express";
import bodyParser from "body-parser";
import { serverPort } from "./config/serverConfig";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors";

// Create Express server with mongoConfig
const app = express();

app.set("port", serverPort);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (req, res) => res.send("Lectern"));
app.get("/dictionaries", dictionaryController.listDictionaries);
app.post("/dictionaries", dictionaryController.createDictionary);
app.post("/dictionaries/files", dictionaryController.addFile);
app.put("/dictionaries/files", dictionaryController.updateFile);

app.use(errorHandler);

export default app;
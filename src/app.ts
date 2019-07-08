import express from "express";
import bodyParser from "body-parser";
import { serverPort } from "./config/serverConfig";
import mongoose from "mongoose";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors";
import { constructMongoUri } from "./config/mongo"

// Create Express server
const app = express();

mongoose.connect(constructMongoUri({includeDb: true}), { useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

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

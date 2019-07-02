import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import * as dictionaryController from "./controllers/dictionaryController";

// Create Express server
const app = express();

app.set("port", 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/dictionaries", dictionaryController.createDictionary);

export default app;

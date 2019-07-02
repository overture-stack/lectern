import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import * as dictionaryController from "./controllers/dictionaryController";
import { errorHandler } from "./utils/errors"

// Create Express server
const app = express();

mongoose.connect("mongodb://localhost:27017/lectern", { useNewUrlParser: true} ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  ).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
  });

app.set("port", 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(errorHandler)

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/dictionaries", dictionaryController.listDictionaries);
app.post("/dictionaries", dictionaryController.createDictionary);

export default app;

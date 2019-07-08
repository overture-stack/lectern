
import app from "./app";
import mongoose from "mongoose";
import { constructMongoUri } from "./config/mongo";


mongoose.connect(constructMongoUri(), { useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch( (err: Error) => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});


/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;

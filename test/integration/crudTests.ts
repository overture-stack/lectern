import "chai-http";
import "mocha";
const chai = require("chai");
import app from "../../src/app";
import { GenericContainer } from "testcontainers";
import { constructTestUri } from "../../src/config/mongo";
import { run } from "mocha";
import { StartedTestContainer } from "testcontainers/dist/test-container";
import mongoose from "mongoose";


let container: StartedTestContainer;

chai.use(require("chai-http"));
chai.should();

describe("Basic CRUD", () => {

    before(async () => {
        container = await new GenericContainer("mongo", "xenial").withExposedPorts(27017).start();
        mongoose.connect(constructTestUri(container.getContainerIpAddress(), container.getMappedPort(27017).toString()), { useNewUrlParser: true }).then(
            () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
          ).catch( (err: Error) => {
            console.log("MongoDB connectio  n error. Please make sure MongoDB is running. " + err);
            process.exit();
          });
    });

    describe("Create", () => {
        it("Should create a new dictionary", (done: Mocha.Done) => {
            chai.request(app)
                .post("/dictionaries")
                .send(require("./fixtures/createDictionary.json"))
                .end((err: Error, res: Response) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(200);
                    setImmediate(done);
                });
        });

        it("Should 409", (done: Mocha.Done) => {
            chai.request(app)
                .post("/dictionaries")
                .send(require("./fixtures/createDictionary.json"))
                .end((err: Error, res: Response) => {
                    chai.expect(err).to.be.null;
                    chai.expect(res).to.have.status(409);
                    setImmediate(done);
                });
        });
    });

    after( async () => {
        await container.stop();
        await mongoose.connection.close();
    });

});
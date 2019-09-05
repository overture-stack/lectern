import "chai-http";
import "mocha";
import chai, { expect } from "chai";
import app from "../../src/app";
import { GenericContainer } from "testcontainers";
import { constructTestUri } from "../../src/config/mongo";
import { StartedTestContainer } from "testcontainers/dist/test-container";
import mongoose from "mongoose";
import { Response } from "superagent";


let container: StartedTestContainer;

chai.use(require("chai-http"));

describe("CRUD", () => {

    before(async () => {
        container = await new GenericContainer("mongo", "xenial").withExposedPorts(27017).start();
        mongoose.connect(constructTestUri(container.getContainerIpAddress(), container.getMappedPort(27017).toString()), { useNewUrlParser: true }).then(
            () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
        ).catch((err: Error) => {
            console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
            process.exit();
        });
    });

    describe("Create", () => {
        it("Should create a new dictionary", (done: Mocha.Done) => {
            chai.request(app)
                .post("/dictionaries")
                .send(require("./fixtures/createDictionary.json"))
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    setImmediate(done);
                });
        });

        it("Should 400 on creating same dictionary due to same version number", (done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createDictionary.json");
            chai.request(app)
                .post("/dictionaries")
                .send(dictRequest)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    setImmediate(done);
                });
        });

        it("Should 400 new dictionary of lower version number", (done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createDictionary.json");
            dictRequest.version = "0.1";
            chai.request(app)
            .post("/dictionaries")
            .send(dictRequest)
            .end((err: Error, res: Response) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                setImmediate(done);
            });
        });

        it("Should create a new dictionary with lots of Key/Value meta fields", (done: Mocha.Done) => {
            chai.request(app)
                .post("/dictionaries")
                .send(require("./fixtures/createKeyValue.json"))
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    setImmediate(done);
                });
        });

        it("Should 400 with meta fields that are not string/boolean/integer/number", (done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createKeyValueBad.json");
            chai.request(app)
            .post("/dictionaries")
            .send(dictRequest)
            .end((err: Error, res: Response) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                setImmediate(done);
            });
        });

    });

    describe("Read", () => {
        const testVersion = "123.456";

        // STATE!
        let id: string;

        before((done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createDictionary.json");
            dictRequest.version = testVersion;
            chai.request(app)
                .post("/dictionaries/")
                .send(dictRequest)
                .end((_: Request, res: Response) => {
                    id = res.body._id;
                    done();
                });
        });

        it("Should get a single dictionary by id", (done: Mocha.Done) => {
            chai.request(app)
                .get("/dictionaries/" + id)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.version).to.equal(testVersion);
                    setImmediate(done);
                });
        });

        it("Should 400 with a badly formed dictionary id", (done: Mocha.Done) => {
            chai.request(app)
                .get("/dictionaries/aslkjfdabhskjlfhsdalkjfhsadfklsja")
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    setImmediate(done);
                });
        });

        it("Should get a single dictionary by name and version", (done: Mocha.Done) => {
            const name = "ARGO Dictionary";
            chai.request(app)
                .get(`/dictionaries/?name=${name}&version=${testVersion}`)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body[0]._id).to.equal(id);
                    setImmediate(done);
                });
        });
    });

    describe("Update", () => {
        const testVersion = "10.10";

        // STATE!
        let id: string;
        let nextId: string;

        before((done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createDictionary.json");
            dictRequest.name = "updateTest";
            dictRequest.version = testVersion;
            chai.request(app)
                .post("/dictionaries/")
                .send(dictRequest)
                .end((err: Error, res: Response) => {
                    id = res.body._id;
                    done();
                });
        });

        it("Should successfully add a file to a dictionary and increment to next major version", (done: Mocha.Done) => {
            const newFile = require("./fixtures/newFile.json");
            chai.request(app)
                .post(`/dictionaries/${id}/schemas`)
                .send(newFile)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.version).to.equal("11.0");
                    nextId = res.body._id;
                    setImmediate(done);
                });
        });

        it("Should successfully update a file in a dictionary and increment to next minor version", (done: Mocha.Done) => {
            const newFile = require("./fixtures/updateNewFile.json");
            chai.request(app)
                .put(`/dictionaries/${nextId}/schemas`)
                .send(newFile)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.version).to.equal("11.1");
                    setImmediate(done);
                });
        });

        it("Should respond with bad request on poorly formatted dicitonary_id", (done: Mocha.Done) => {
            const newFile = require("./fixtures/updateNewFile.json");
            chai.request(app)
                .put(`/dictionaries/kljadsbflsdafsdakljsdfkp/schemas`)
                .send(newFile)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    setImmediate(done);
                });
        });
    });

    describe("Delete", () => {
        // Place Holder
        it("Should do nothing as we do not delete", () => { });
    });

    describe("Dictionary Update version edge cases", () => {
        const firstVersion = "12.02";
        const secondVersion = "13.0";

        // STATE!
        let id: string;
        let nextId: string;

        before((done: Mocha.Done) => {
            const dictRequest = require("./fixtures/createDictionary.json");
            dictRequest.name = "updateTest";
            dictRequest.version = firstVersion;
            const firstPromise = chai.request(app)
                .post("/dictionaries/")
                .send(dictRequest)
                .then((res: Response) => {
                    id = res.body._id;
                });
            firstPromise.then( () => {
                const sameDict = require("./fixtures/createDictionary.json");
                sameDict.name = "updateTest";
                sameDict.version = secondVersion;
                chai.request(app)
                .post("/dictionaries/")
                .send(dictRequest)
                .end((err: Error, res: Response) => {
                    nextId = res.body._id;
                    done();
                });
            });
        });

        it("Should fail to update file as it is not for latest dictionary version", (done: Mocha.Done) => {
            const newFile = require("./fixtures/newFile.json");
            chai.request(app)
                .post(`/dictionaries/${id}/schemas`)
                .send(newFile)
                .end((err: Error, res: Response) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    expect(res.body["message"]).to.equal("Dictionary that you are trying to update is not the latest version.");
                    setImmediate(done);
                });
        });

    });

    after(async () => {
        await container.stop();
        await mongoose.connection.close();
    });

});
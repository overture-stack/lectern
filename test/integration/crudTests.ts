import "chai-http";
import "mocha";
const chai = require("chai");
import app from "../../src/app";

chai.use(require("chai-http"));
chai.should();

describe("Basic CRUD", () => {
    it("Should create a new dictionary", (done) => {
        chai.request(app)
        .post("/dictionaries")
        .send(require("./fixtures/createDictionary.json"))
        .end((err: Error, res: Response) => {
            chai.expect(err).to.be.null;
            chai.expect(res).to.have.status(200);
            done();
        });
    });
});

import { expect } from "chai";
import { DictionaryDocument } from "../../src/models/Dictionary";
import { diff } from "../../src/diff/DictionaryDiff";

describe("Compute diff report between dictionary versions", () => {

    const dict1 = require("./fixtures/dict1.json") as DictionaryDocument;
    const dict2 = require("./fixtures/dict2.json") as DictionaryDocument;

    it("Should compute the diff, with one file added, and one updated", () => {
        const diffReport = diff(dict1, dict2);
        expect(diffReport).is.not.undefined;
    });

});
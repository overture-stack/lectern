import { expect } from "chai";
import { DictionaryDocument } from "../../src/models/Dictionary";
import { diff, getFieldMap } from "../../src/diff/DictionaryDiff";

describe("Compute diff report between dictionary versions", () => {

    const dict1 = require("./fixtures/dict1.json") as DictionaryDocument;
    const dict2 = require("./fixtures/dict2.json") as DictionaryDocument;

    it("Should compute the field map correctly", () => {
        const mockDocument = {
            name: "foo",
            files: [
                {
                    "name": "bar",
                    "fields": [
                        {
                            "name": "baz",
                        },
                        {
                            "name": "qux"
                        }
                    ]
                }
            ]
        };

        const fieldMap = getFieldMap(mockDocument as DictionaryDocument);
        expect(fieldMap.size).to.be.equal(2);
        expect(fieldMap.get("bar.baz")).to.be.not.undefined;
    });

    it("Should compute the diff, with one file added (3 fields), and 3 updated on existing file", () => {
        const diffReport = diff(dict1, dict2);
        expect(diffReport).is.not.undefined;
        expect(diffReport.size).to.be.equal(6);
    });

});
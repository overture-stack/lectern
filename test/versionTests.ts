import { expect } from "chai";
import { isValidVersion, incrementMinor, incrementMajor } from "../src/utils/version";

describe("Verifying version strings", () => {

    it("Should verify a proper version string of form X.Y", () => {
        expect(isValidVersion("1.0")).to.equal(true);
    });

    it("Should verify with leading zero", () => {
        expect(isValidVersion("0.55")).to.equal(true);
    });

    it("Should reject an empty string", () => {
        expect(isValidVersion("")).to.equal(false);
    });

    it("Should reject version with less than two parts", () => {
        expect(isValidVersion("34534523")).to.equal(false);
    });

    it("Should reject version with more than two parts", () => {
        expect(isValidVersion("1.2.3")).to.equal(false);
    });

});

describe("Incrementing version strings", () => {

    it("Should increment minor version", () => {
        expect(incrementMinor("1.0")).to.equal("1.1");
    });

    it("Should increment minor version with increase in digits", () => {
        expect(incrementMinor("1.9")).to.equal("1.10");
    });

    it("Should increment major version", () => {
        expect(incrementMajor("1.9")).to.equal("2.9");
    });

    it("Should increment major version with increase in digits", () => {
        expect(incrementMajor("9.9")).to.equal("10.9");
    });

});

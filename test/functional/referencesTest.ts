import { expect } from "chai";
import { DictionaryDocument } from "../../src/models/Dictionary";
import { replaceReferences } from "../../src/utils/references";

const noReferencesSectionInput = require('./fixtures/references/no_references_section/input.json') as DictionaryDocument;
const noReferencesSectionOutput = require('./fixtures/references/no_references_section/output.json') as DictionaryDocument;
const emptyReferencesInput = require('./fixtures/references/empty_references_section/input.json') as DictionaryDocument;
const emptyReferencesOutput = require('./fixtures/references/empty_references_section/output.json') as DictionaryDocument;
const simpleReferencesInput = require('./fixtures/references/simple_references/input.json') as DictionaryDocument;
const simpleReferencesOutput = require('./fixtures/references/simple_references/output.json') as DictionaryDocument;
const codeListReferencesInput = require('./fixtures/references/codeList_references/input.json') as DictionaryDocument;
const codeListReferencesOutput = require('./fixtures/references/codeList_references/output.json') as DictionaryDocument;
const referencesWithinReferencesInput = require('./fixtures/references/references_within_references/input.json') as DictionaryDocument;
const referencesWithinReferencesOutput = require('./fixtures/references/references_within_references/output.json') as DictionaryDocument;
const nonExistingReferencesInput = require('./fixtures/references/non_existing_references/input.json') as DictionaryDocument;
const cyclicReferencesInput = require('./fixtures/references/cyclic_references/input.json') as DictionaryDocument;

describe('Replace references in the schemas of a dictionary', () => {
    it('Should return the same original schema if dictionaty does not contain a references section', () => {
        const replacedDictionary = replaceReferences(noReferencesSectionInput);
        expect(replacedDictionary).to.deep.eq(noReferencesSectionOutput);
    });
    it('Should return the same original schema if dictionaty contains an empty references section', () => {
        const replacedDictionary = replaceReferences(emptyReferencesInput);
        expect(replacedDictionary).to.deep.eq(emptyReferencesOutput);
    });
    it('Should return the schema with simple references replaced', () => {
        const replacedDictionary = replaceReferences(simpleReferencesInput);
        expect(replacedDictionary).to.deep.eq(simpleReferencesOutput);
    });
    it('Should return the schema where references inside codeLists are replaced', () => {
        const replacedDictionary = replaceReferences(codeListReferencesInput);
        expect(replacedDictionary).to.deep.eq(codeListReferencesOutput);
    });
    it('Should return the schema where references inside references are replaced', () => {
        const replacedDictionary = replaceReferences(referencesWithinReferencesInput);
        expect(replacedDictionary).to.deep.eq(referencesWithinReferencesOutput);
    });
    it('Should throw exception if reference does not exist', () => {
        expect(function () {
            replaceReferences(nonExistingReferencesInput);
        }).to.throw('Unknown reference found - Reference: NON_EXISTING_REFERENCE. Schema: donor Field: gender - Path: restrictions.codeList');
    });
    it('Should throw exception if cyclic references are found', () => {
        expect(function () {
            replaceReferences(cyclicReferencesInput);
        }).to.throw('Cyclical references found - Reference: OTHER. Schema: donor Field: gender - Path: restrictions.codeList');
    });
});
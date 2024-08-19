/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { expect } from 'chai';
import { replaceReferences } from '../src/references';

import assert from 'assert';
import codeListReferencesInput from './fixtures/references/codeList_references/input';
import codeListReferencesOutput from './fixtures/references/codeList_references/output';
import cyclicReferencesInput from './fixtures/references/cyclic_references/input';
import emptyReferencesInput from './fixtures/references/empty_references_section/input';
import emptyReferencesOutput from './fixtures/references/empty_references_section/output';
import nestedMetaReferencesInput from './fixtures/references/nested_meta_references/input';
import nestedMetaReferencesOutput from './fixtures/references/nested_meta_references/output';
import noReferencesSectionInput from './fixtures/references/no_references_section/input';
import noReferencesSectionOutput from './fixtures/references/no_references_section/output';
import noReferencesTagsInput from './fixtures/references/no_referece_tags/input';
import noReferencesTagsOutput from './fixtures/references/no_referece_tags/output';
import nonExistingReferencesInput from './fixtures/references/non_existing_references/input';
import referencesWithinReferencesInput from './fixtures/references/references_within_references/input';
import referencesWithinReferencesOutput from './fixtures/references/references_within_references/output';
import regexReferencesInput from './fixtures/references/regex_reference/input';
import regexReferencesOutput from './fixtures/references/regex_reference/output';
import regexArrayReferencesInput from './fixtures/references/regex_reference_with_array/input';
import regexArrayReferencesOutput from './fixtures/references/regex_reference_with_array/output';
import restrictionsArrayWithReferencesInput from './fixtures/references/restrictions_array_with_references/input';
import restrictionsArrayWithReferencesOutput from './fixtures/references/restrictions_array_with_references/output';
import selfReferencesInput from './fixtures/references/self_references/input';
import simpleReferencesInput from './fixtures/references/simple_references/input';
import simpleReferencesOutput from './fixtures/references/simple_references/output';

describe('Replace References', () => {
	it('Returns unmodified schema when dictionary does not contain a references section', () => {
		const replacedDictionary = replaceReferences(noReferencesSectionInput);
		expect(replacedDictionary).to.deep.eq(noReferencesSectionOutput);
	});
	it('Returns unmodified schema when dictionary contains an empty references section', () => {
		const replacedDictionary = replaceReferences(emptyReferencesInput);
		expect(replacedDictionary).to.deep.eq(emptyReferencesOutput);
	});
	it('Returns unmodified schema when no ReferenceTag values are used', () => {
		const replacedDictionary = replaceReferences(noReferencesTagsInput);
		expect(replacedDictionary).to.deep.eq(noReferencesTagsOutput);
	});
	it('Throws an error when a ReferenceTag to an unknown path is provided', () => {
		expect(() => replaceReferences(nonExistingReferencesInput)).to.throw(
			"No reference found for provided tag '#/NON_EXISTING_REFERENCE'",
		);
	});
	it('Throws an error if cyclic references are found', () => {
		expect(() => replaceReferences(cyclicReferencesInput)).to.throw("Cyclical references found for '#/OTHER'");
	});
	it('Throws an error if self references are found', () => {
		expect(() => replaceReferences(selfReferencesInput)).to.throw("Cyclical references found for '#/SELF_REFERENCE'");
	});
	it('Replaces references when restrictions are in arrays', () => {
		restrictionsArrayWithReferencesInput;
		const replacedDictionary = replaceReferences(restrictionsArrayWithReferencesInput);
		expect(replacedDictionary).to.deep.eq(restrictionsArrayWithReferencesOutput);
	});
	// TODO: Check reference replacement in meta
	it('Should return the schema with simple references replaced', () => {
		const replacedDictionary = replaceReferences(simpleReferencesInput);
		expect(replacedDictionary).to.deep.eq(simpleReferencesOutput);
	});
	it('Should return the schema where references inside references are replaced', () => {
		const output = replaceReferences(referencesWithinReferencesInput);
		expect(output).to.deep.eq(referencesWithinReferencesOutput);
	});
	it('Replaces reference tag value in meta nested properties', () => {
		const replacedDictionary = replaceReferences(nestedMetaReferencesInput);
		expect(replacedDictionary).to.deep.eq(nestedMetaReferencesOutput);
	});
	describe('String Restrictions', () => {
		it('CodeList with references are replaced', () => {
			// has a couple test cases in the test fixture dictionary:
			// - array containing ReferenceTag is replaced by array with reference values added to array
			// - CodeList with ReferenceTag to single value is replaced with an array with the single value
			const replacedDictionary = replaceReferences(codeListReferencesInput);
			expect(replacedDictionary).to.deep.eq(codeListReferencesOutput);
		});
		it('Regex with ReferenceTag is replaced by single value', () => {
			const output = replaceReferences(regexReferencesInput);
			expect(output).to.deep.eq(regexReferencesOutput);
		});
		it('Regex with ReferenceTag to array value throws an error', () => {
			const output = replaceReferences(regexArrayReferencesInput);
			expect(output).to.deep.eq(regexArrayReferencesOutput);
		});
	});
});

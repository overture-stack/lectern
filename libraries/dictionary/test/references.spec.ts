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

import noReferencesSectionInput from './fixtures/references/no_references_section/input';
import noReferencesSectionOutput from './fixtures/references/no_references_section/output';
import emptyReferencesInput from './fixtures/references/empty_references_section/input';
import emptyReferencesOutput from './fixtures/references/empty_references_section/output';
import simpleReferencesInput from './fixtures/references/simple_references/input';
import simpleReferencesOutput from './fixtures/references/simple_references/output';
import codeListReferencesInput from './fixtures/references/codeList_references/input';
import codeListReferencesOutput from './fixtures/references/codeList_references/output';
import referencesWithinReferencesInput from './fixtures/references/references_within_references/input';
import referencesWithinReferencesOutput from './fixtures/references/references_within_references/output';
import scriptReferencesInput from './fixtures/references/script_references/input';
import scriptReferencesOutput from './fixtures/references/script_references/output';
import regexReferencesInput from './fixtures/references/regex_reference/input';
import regexReferencesOutput from './fixtures/references/regex_reference/output';
import regexArrayReferencesInput from './fixtures/references/regex_reference/input_with_array';
import nonExistingReferencesInput from './fixtures/references/non_existing_references/input';
import cyclicReferencesInput from './fixtures/references/cyclic_references/input';
import selfReferencesInput from './fixtures/references/self_references/input';

describe('Replace References', () => {
	it('Should return the same original schema if dictionary does not contain a references section', () => {
		const replacedDictionary = replaceReferences(noReferencesSectionInput);
		expect(replacedDictionary).to.deep.eq(noReferencesSectionOutput);
	});
	it('Should return the same original schema if dictionary contains an empty references section', () => {
		const replacedDictionary = replaceReferences(emptyReferencesInput);
		expect(replacedDictionary).to.deep.eq(emptyReferencesOutput);
	});
	// TODO: Check reference replacement in meta
	it('Should return the schema with simple references replaced', () => {
		const replacedDictionary = replaceReferences(simpleReferencesInput);
		expect(replacedDictionary).to.deep.eq(simpleReferencesOutput);
	});
	it('Should return the schema where references inside codeLists are replaced', () => {
		const replacedDictionary = replaceReferences(codeListReferencesInput);
		expect(replacedDictionary).to.deep.eq(codeListReferencesOutput);
	});
	it('Should return the schema where references inside references are replaced', () => {
		const output = replaceReferences(referencesWithinReferencesInput);
		expect(output).to.deep.eq(referencesWithinReferencesOutput);
	});
	it('Should return the schema where references inside scripts arrays are replaced', () => {
		const output = replaceReferences(scriptReferencesInput);
		expect(output).to.deep.eq(scriptReferencesOutput);
	});
	it('Regex Reference replaced successfully', () => {
		const output = replaceReferences(regexReferencesInput);
		expect(output).to.deep.eq(regexReferencesOutput);
	});
	it('Regex Reference cannot be an array', () => {
		expect(() => replaceReferences(regexArrayReferencesInput)).to.throw(
			`Field 'some_id' has restriction 'regex' with a reference '#/regex/ID_FORMAT' that resolves to an array. This restriction must be a string.`,
		);
	});
	it('Should throw exception if reference does not exist', () => {
		expect(() => replaceReferences(nonExistingReferencesInput)).to.throw(
			"No reference found for provided tag '#/NON_EXISTING_REFERENCE'",
		);
	});
	it('Should throw exception if cyclic references are found', () => {
		expect(() => replaceReferences(cyclicReferencesInput)).to.throw("Cyclical references found for '#/OTHER'");
	});
	it('Should throw exception if self references are found', () => {
		expect(() => replaceReferences(selfReferencesInput)).to.throw("Cyclical references found for '#/SELF_REFERENCE'");
	});
});

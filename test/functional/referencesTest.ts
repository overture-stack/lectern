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
import { replaceReferences } from '../../src/utils/references';
import { Dictionary } from '../../src/types/dictionaryTypes';
import { InvalidReferenceError } from '../../src/utils/errors';

const noReferencesSectionInput =
	require('../fixtures/dictionaries/references/no_references_section/input.json') as Dictionary;
const noReferencesSectionOutput =
	require('../fixtures/dictionaries/references/no_references_section/output.json') as Dictionary;
const emptyReferencesInput =
	require('../fixtures/dictionaries/references/empty_references_section/input.json') as Dictionary;
const emptyReferencesOutput =
	require('../fixtures/dictionaries/references/empty_references_section/output.json') as Dictionary;
const simpleReferencesInput = require('../fixtures/dictionaries/references/simple_references/input.json') as Dictionary;
const simpleReferencesOutput =
	require('../fixtures/dictionaries/references/simple_references/output.json') as Dictionary;
const codeListReferencesInput =
	require('../fixtures/dictionaries/references/codeList_references/input.json') as Dictionary;
const codeListReferencesOutput =
	require('../fixtures/dictionaries/references/codeList_references/output.json') as Dictionary;
const referencesWithinReferencesInput =
	require('../fixtures/dictionaries/references/references_within_references/input.json') as Dictionary;
const referencesWithinReferencesOutput =
	require('../fixtures/dictionaries/references/references_within_references/output.json') as Dictionary;
const nonExistingReferencesInput =
	require('../fixtures/dictionaries/references/non_existing_references/input.json') as Dictionary;
const cyclicReferencesInput = require('../fixtures/dictionaries/references/cyclic_references/input.json') as Dictionary;
const selfReferencesInput = require('../fixtures/dictionaries/references/self_references/input.json') as Dictionary;

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
		console.log(JSON.stringify(output));
		expect(output).to.deep.eq(referencesWithinReferencesOutput);
	});
	it('Should throw exception if reference does not exist', () => {
		expect(function () {
			replaceReferences(nonExistingReferencesInput);
		}).to.throw(InvalidReferenceError);
	});
	it('Should throw exception if cyclic references are found', () => {
		expect(function () {
			replaceReferences(cyclicReferencesInput);
		}).to.throw(InvalidReferenceError);
	});
	it('Should throw exception if self references are found', () => {
		expect(function () {
			replaceReferences(selfReferencesInput);
		}).to.throw(InvalidReferenceError);
	});
});

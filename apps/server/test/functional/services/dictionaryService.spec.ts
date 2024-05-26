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

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { DictionaryDocument, VersionUtils } from 'dictionary';
import * as immer from 'immer';
import { Error as MongooseError } from 'mongoose';
import sinon from 'sinon';
import * as DictionaryRepo from '../../../src/db/dictionary';
import * as dictionaryService from '../../../src/services/dictionaryService';
import DICTIONARY_1_BASE from '../../fixtures/dictionaries/1_base';
import DICTIONARY_2_ADDEDSCHEMA from '../../fixtures/dictionaries/2_base_schema_added';
import DICTIONARY_3_UPDATEDSCHEMA from '../../fixtures/dictionaries/3_base_schema_updated';
import DICTIONARY_REFERENCES_INVALID from '../../fixtures/dictionaries/invalidReferences';
import DICTIONARY_REFERENCES_VALID from '../../fixtures/dictionaries/validReferences';
import SCHEMA_1_EXISTING from '../../fixtures/schemas/primitives';
import SCHEMA_REFERENCES, { references } from '../../fixtures/schemas/references';
import SCHEMA_2_ADD from '../../fixtures/schemas/schemaChangesBase';
import SCHEMA_3_UPDATES from '../../fixtures/schemas/schemaChangesUpdated';

chai.use(chaiAsPromised);

// When stubbing the return for async methods, the return value needs to be wrapped in a promise
const wrapPromise = <T>(value: T): Promise<T> => new Promise((resolve) => resolve(value));
const asDocument = <T>(value: T): T & { _id: string; createdAt: string; updatedAt: string } => ({
	...value,
	_id: '',
	createdAt: '',
	updatedAt: '',
});

describe('Dictionary Service', () => {
	afterEach(function () {
		+sinon.restore();
	});
	describe('getOneById', () => {
		it('Returns the dictionary object from the db', async () => {
			const stub = sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));

			const fakeId = '649745e18a1893594c8bdbc3';
			const result = await dictionaryService.getOneById(fakeId);
			expect(stub.calledOnceWith(fakeId)).to.be.true;
			expect(result).to.deep.equal(asDocument(DICTIONARY_1_BASE));
		});

		it('Throws NotFoundError when the repo returns null', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(null));
			await expect(dictionaryService.getOneById('')).eventually.rejected;
		});
		it('Throws NotFoundError when the repo throws a CastError (invalid ID)', async () => {
			sinon.stub(DictionaryRepo, 'findById').throws(new MongooseError.CastError('', '', ''));
			await expect(dictionaryService.getOneById('asdf')).eventually.rejected;
		});
	});

	describe('getOneByNameAndVersion', () => {
		it('Returns a dictionary object from the db', async () => {
			const stub = sinon
				.stub(DictionaryRepo, 'findByNameAndVersion')
				.returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));

			const name = 'name';
			const version = '1.0';
			const result = await dictionaryService.getOneByNameAndVersion(name, version);
			expect(stub.calledOnceWith(name, version)).to.be.true;
			expect(result).to.deep.equal(asDocument(DICTIONARY_1_BASE));
		});
		it('Throws NotFoundError when the repo returns null', async () => {
			sinon.stub(DictionaryRepo, 'findByNameAndVersion').returns(wrapPromise(null));
			await expect(dictionaryService.getOneByNameAndVersion('', '')).eventually.rejected;
		});
	});

	describe('getLatestVersion', () => {
		it('Returns the latest version', async () => {
			const stubResponse: DictionaryDocument[] = [
				DICTIONARY_1_BASE,
				DICTIONARY_3_UPDATEDSCHEMA,
				DICTIONARY_2_ADDEDSCHEMA,
			].map(asDocument);
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise(stubResponse));
			const result = await dictionaryService.getLatestVersion('');
			expect(result).equal(DICTIONARY_3_UPDATEDSCHEMA.version);
		});
		it('Returns 0.0 if there are no dictionaries', async () => {
			const stubResponse: DictionaryDocument[] = [];
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise(stubResponse));
			const result = await dictionaryService.getLatestVersion('');
			expect(result).equal('0.0');
		});
	});

	describe('checkLatest', () => {
		it('Returns true if the latest', async () => {
			const stubResponse: DictionaryDocument[] = [
				DICTIONARY_1_BASE,
				DICTIONARY_3_UPDATEDSCHEMA,
				DICTIONARY_2_ADDEDSCHEMA,
			].map(asDocument);
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise(stubResponse));
			const result = await dictionaryService.checkLatest(DICTIONARY_3_UPDATEDSCHEMA);
			await expect(result).true;
		});
		it('Returns false if not the latest', async () => {
			const stubResponse: DictionaryDocument[] = [
				DICTIONARY_1_BASE,
				DICTIONARY_3_UPDATEDSCHEMA,
				DICTIONARY_2_ADDEDSCHEMA,
			].map(asDocument);
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise(stubResponse));
			await expect(dictionaryService.checkLatest(DICTIONARY_1_BASE)).eventually.false;
		});
		it('Returns false if the provided dictionary version is not found', async () => {
			const stubResponse: DictionaryDocument[] = [DICTIONARY_2_ADDEDSCHEMA].map(asDocument);
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise(stubResponse));
			const result = await dictionaryService.checkLatest(DICTIONARY_1_BASE);
			await expect(result).false;
		});
	});

	describe('create', () => {
		// Create needs two stubs:
		// 1. listByName - checks existing versions of dictionaries with the same name
		// 2. addDictionary - method that saves the dictionary to mongo and returns the complete dictionary
		it('Returns dictionary on success', async () => {
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([]));
			const addStub = sinon.stub(DictionaryRepo, 'addDictionary').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			const result = await dictionaryService.create(DICTIONARY_1_BASE);
			expect(result).deep.equal(asDocument(DICTIONARY_1_BASE));
			expect(addStub.calledOnce).true;
			expect(addStub.calledWithMatch(DICTIONARY_1_BASE)).true;
		});
		it('Throws error when the dictionary is not latest', async () => {
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_2_ADDEDSCHEMA].map(asDocument)));
			await expect(dictionaryService.create(DICTIONARY_1_BASE)).eventually.rejected;
		});
		it('Returns successfully with valid references', async () => {
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([]));
			const addStub = sinon
				.stub(DictionaryRepo, 'addDictionary')
				.returns(wrapPromise(asDocument(DICTIONARY_REFERENCES_VALID)));
			const result = await dictionaryService.create(DICTIONARY_REFERENCES_VALID);
			expect(result).deep.equal(asDocument(DICTIONARY_REFERENCES_VALID));
			expect(addStub.calledOnce).true;
			expect(addStub.calledWithMatch(DICTIONARY_REFERENCES_VALID)).true;
		});
		it('Throws InvalidReferenceError when dictionary has invalid references', async () => {
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([]));
			await expect(dictionaryService.create(DICTIONARY_REFERENCES_INVALID)).eventually.rejected;
		});
	});

	describe('addSchema', () => {
		// Add Schema needs three stubs:
		// 1. findByID - gets the dictionary being added to
		// 2. listByName - checks that this dictionary is the latest
		// 2. addDictionary - method that saves the dictionary to mongo and returns the complete dictionary
		it('Returns dictionary with schema added successfully', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_1_BASE].map(asDocument)));
			const addStub = sinon
				.stub(DictionaryRepo, 'addDictionary')
				.returns(wrapPromise(asDocument(DICTIONARY_2_ADDEDSCHEMA)));
			const result = await dictionaryService.addSchema('fakeId', SCHEMA_2_ADD);
			expect(result).deep.equal(asDocument(DICTIONARY_2_ADDEDSCHEMA));
			// Implicit in the check vs DICTIONARY_2 is that the version has a major increment
			expect(addStub.calledOnce).true;
		});
		it('Throws error when the dictionary is not latest', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon
				.stub(DictionaryRepo, 'listByName')
				.returns(wrapPromise([DICTIONARY_1_BASE, DICTIONARY_2_ADDEDSCHEMA].map(asDocument)));
			await expect(dictionaryService.addSchema('fakeId', SCHEMA_2_ADD)).eventually.rejected;
		});

		it('Throws InvalidReferenceError if dictionary references are invalid', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_1_BASE].map(asDocument)));
			await expect(dictionaryService.addSchema('fakeId', SCHEMA_REFERENCES)).eventually.rejected;
		});
		it('Returns successfully with valid references', async () => {
			//
			const dictionaryWithReferences = immer.produce(DICTIONARY_1_BASE, (draft) => {
				draft.references = references;
			});
			const updatedDictionary = immer.produce(dictionaryWithReferences, (draft) => {
				draft.schemas.push(SCHEMA_REFERENCES);
				draft.version = '2.0';
			});
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(dictionaryWithReferences)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([dictionaryWithReferences].map(asDocument)));
			const addStub = sinon.stub(DictionaryRepo, 'addDictionary').returns(wrapPromise(asDocument(updatedDictionary)));
			const result = await dictionaryService.addSchema('', SCHEMA_REFERENCES);
			expect(result).deep.equal(asDocument(updatedDictionary));
			expect(addStub.calledWithMatch(updatedDictionary));
		});
		it('Throws ConflictError if added schema already exists', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_1_BASE].map(asDocument)));
			await expect(dictionaryService.addSchema('fakeId', SCHEMA_1_EXISTING)).eventually.rejected;
		});
		// TODO: Test that all restriction values were normalized
	});
	describe('updateSchema', () => {
		// Add Schema needs three stubs:
		// 1. findByID - gets the dictionary being added to
		// 2. listByName - checks that this dictionary is the latest
		// 2. addDictionary - method that saves the dictionary to mongo and returns the complete dictionary
		it('Returns dictionary with schema added successfully', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_2_ADDEDSCHEMA)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_2_ADDEDSCHEMA].map(asDocument)));
			const addStub = sinon
				.stub(DictionaryRepo, 'addDictionary')
				.returns(wrapPromise(asDocument(DICTIONARY_3_UPDATEDSCHEMA)));
			const result = await dictionaryService.updateSchema('fakeId', SCHEMA_3_UPDATES, false);
			expect(result).deep.equal(asDocument(DICTIONARY_3_UPDATEDSCHEMA));
			// Implicit in the check vs DICTIONARY_2 is that the version has a major increment
			expect(addStub.calledOnce).true;
			expect(addStub.calledWithMatch(DICTIONARY_3_UPDATEDSCHEMA)).true;
		});
		it('Returns dictionary with major version increment if specified', async () => {
			const dictionaryWithMajorVersion = immer.produce(DICTIONARY_3_UPDATEDSCHEMA, (draft) => {
				draft.version = VersionUtils.incrementMajor(DICTIONARY_2_ADDEDSCHEMA.version);
			});
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_2_ADDEDSCHEMA)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_2_ADDEDSCHEMA].map(asDocument)));
			const addStub = sinon
				.stub(DictionaryRepo, 'addDictionary')
				.returns(wrapPromise(asDocument(dictionaryWithMajorVersion)));

			const result = await dictionaryService.updateSchema('fakeId', SCHEMA_3_UPDATES, true);

			expect(result).deep.equal(asDocument(dictionaryWithMajorVersion));
			// Implicit in the check vs DICTIONARY_2 is that the version has a major increment
			expect(addStub.calledOnce).true;
			expect(addStub.calledWithMatch(dictionaryWithMajorVersion)).true;
		});
		it('Throws NotFoundError if updated schema does not exist', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_1_BASE].map(asDocument)));
			await expect(dictionaryService.updateSchema('fakeId', SCHEMA_2_ADD, false)).eventually.rejected;
		});
		it('Returns successfully with valid references', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_REFERENCES_VALID)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_REFERENCES_VALID].map(asDocument)));
			const addStub = sinon
				.stub(DictionaryRepo, 'addDictionary')
				.returns(wrapPromise(asDocument(DICTIONARY_REFERENCES_VALID)));
			const result = await dictionaryService.updateSchema('', SCHEMA_REFERENCES, false);
			expect(result).deep.equal(asDocument(DICTIONARY_REFERENCES_VALID));
			expect(addStub.calledWithMatch(DICTIONARY_REFERENCES_VALID));
		});
		it('Throws InvalidReferenceError if dictionary references are invalid', async () => {
			sinon.stub(DictionaryRepo, 'findById').returns(wrapPromise(asDocument(DICTIONARY_1_BASE)));
			sinon.stub(DictionaryRepo, 'listByName').returns(wrapPromise([DICTIONARY_REFERENCES_INVALID].map(asDocument)));
			await expect(dictionaryService.updateSchema('fakeId', SCHEMA_REFERENCES, false)).eventually.rejected;
		});
		// TODO: Test that all restriction values were normalized
	});
});

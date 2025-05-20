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
import 'chai-http';
import 'mocha';
import mongoose from 'mongoose';
import { Response } from 'superagent';
import { GenericContainer } from 'testcontainers';
import { StartedTestContainer } from 'testcontainers/dist/test-container';
import App from '../../src/app';
import { AppConfig } from '../../src/config/appConfig';
import { constructTestUri } from '../../src/utils/mongo';

import createDictionaryFixture from './fixtures/createDictionary.json';

const testConfig: AppConfig = {
	serverPort(): string {
		return process.env.PORT || '3000';
	},

	openApiPath(): string {
		return process.env.OPENAPI_PATH || '/api-docs';
	},

	mongoHost(): string {
		return process.env.MONGO_HOST || 'localhost';
	},

	mongoPort(): string {
		return process.env.MONGO_PORT || '27017';
	},

	mongoUser(): string {
		return process.env.MONGO_USER || 'admin';
	},

	mongoPassword(): string {
		return process.env.MONGO_PASS || 'password';
	},

	mongoDb(): string {
		return process.env.MONGO_DB || 'lectern';
	},

	mongoUrl(): string {
		return 'http://example.com';
	},
};

const app = App(testConfig);
let container: StartedTestContainer;

chai.use(require('chai-http'));

describe('Dictionary Routes', () => {
	before(async () => {
		container = await new GenericContainer('mongo', 'xenial').withExposedPorts(27017).start();
		mongoose
			.connect(constructTestUri(container.getContainerIpAddress(), container.getMappedPort(27017).toString()))
			.then(() => {
				/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
			})
			.catch((err: Error) => {
				console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
				process.exit();
			});
	});

	describe('Create', () => {
		it('Should create a new dictionary', (done: Mocha.Done) => {
			chai
				.request(app)
				.post('/dictionaries')
				.send(createDictionaryFixture)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					setImmediate(done);
				});
		});

		// TODO: This test only passes when run in sequence after the previous test creates a Dictionary.
		// It cannot be tested individually, and this is likely true of several tests in this section.
		// Tests should be independent (units) and not have side-effects that could impact other tests.
		it('Should 400 on creating same dictionary due to same version number', (done: Mocha.Done) => {
			chai
				.request(app)
				.post('/dictionaries')
				.send(createDictionaryFixture)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});

		it('Should 400 new dictionary of lower version number', (done: Mocha.Done) => {
			const badDict = { ...createDictionaryFixture, version: '0.1' };
			chai
				.request(app)
				.post('/dictionaries')
				.send(badDict)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});

		it('Should create a new dictionary with lots of Key/Value meta fields', (done: Mocha.Done) => {
			chai
				.request(app)
				.post('/dictionaries')
				.send(require('./fixtures/createKeyValue.json'))
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					setImmediate(done);
				});
		});

		it('Should 400 with meta fields that are arrays of objects', (done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createKeyValueBad.json');
			chai
				.request(app)
				.post('/dictionaries')
				.send(dictRequest)
				.end((err: unknown, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});

		it('Should 400 with a codeList reference that is not properly formatted', (done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createKeyValueBadReferenceFormat.json');
			chai
				.request(app)
				.post('/dictionaries')
				.send(dictRequest)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});

		it('Should 400 with a reference that is unknown', (done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createKeyValueBadUnknownReference.json');
			chai
				.request(app)
				.post('/dictionaries')
				.send(dictRequest)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});

		it('Should 400 with a reference that provides an illegal value', (done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createKeyValueBadReferenceValueType.json');
			chai
				.request(app)
				.post('/dictionaries')
				.send(dictRequest)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					setImmediate(done);
				});
		});
	});

	describe('Read', () => {
		const testVersion = '123.456';

		// STATE!
		let id: string;

		before((done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createDictionary.json');
			dictRequest.version = testVersion;
			chai
				.request(app)
				.post('/dictionaries/')
				.send(dictRequest)
				.end((_: Request, res: Response) => {
					id = res.body._id;
					done();
				});
		});

		it('Should get a single dictionary by id', (done: Mocha.Done) => {
			chai
				.request(app)
				.get('/dictionaries/' + id)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.version).to.equal(testVersion);
					expect(res.body).to.have.property(
						'description',
						createDictionaryFixture.description,
						'Did not return dictionary `description` properly',
					);
					expect(res.body).to.have.property('meta');
					expect(res.body.meta).to.have.property('a', createDictionaryFixture.meta.a);
					expect(res.body.meta).to.have.property('b', createDictionaryFixture.meta.b);

					setImmediate(done);
				});
		});

		it('Should get a dictionary with references hidden by default', (done: Mocha.Done) => {
			chai
				.request(app)
				.get('/dictionaries/' + id)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.references).to.not.exist;
					const schemaWithReference = res.body.schemas.find((schema: any) => schema.name === 'registration');
					const fieldWithReference = schemaWithReference.fields.find((field: any) => field.name === 'gender');
					expect(fieldWithReference.restrictions.codeList).to.be.an('array');
					setImmediate(done);
				});
		});

		it('Should get a dictionary with references shown when requested', (done: Mocha.Done) => {
			chai
				.request(app)
				.get(`/dictionaries/${id}?references=true`)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.references).to.exist;
					const schemaWithReference = res.body.schemas.find((schema: any) => schema.name === 'registration');
					const fieldWithReference = schemaWithReference.fields.find((field: any) => field.name === 'gender');
					expect(fieldWithReference.restrictions.codeList).to.be.a('string');
					setImmediate(done);
				});
		});

		it('Should 404 with a badly formed dictionary id', (done: Mocha.Done) => {
			chai
				.request(app)
				.get('/dictionaries/aslkjfdabhskjlfhsdalkjfhsadfklsja')
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(404);
					setImmediate(done);
				});
		});

		it('Should get a single dictionary by name and version', (done: Mocha.Done) => {
			const name = 'Test Dictionary';
			chai
				.request(app)
				.get(`/dictionaries/?name=${name}&version=${testVersion}`)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body[0]._id).to.equal(id);
					setImmediate(done);
				});
		});
	});

	describe('Update', () => {
		const testVersion = '10.10';

		// STATE!
		let id: string;
		let nextId: string;

		before((done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createDictionary.json');
			dictRequest.name = 'updateTest';
			dictRequest.version = testVersion;
			chai
				.request(app)
				.post('/dictionaries/')
				.send(dictRequest)
				.end((_err: Error, res: Response) => {
					id = res.body._id;
					done();
				});
		});

		it('Should successfully add a schema to a dictionary and increment to next major version', (done: Mocha.Done) => {
			const newFile = require('./fixtures/newFile.json');
			chai
				.request(app)
				.post(`/dictionaries/${id}/schemas`)
				.send(newFile)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.version).to.equal('11.0');
					nextId = res.body._id;
					setImmediate(done);
				});
		});

		it('Should successfully update a schema in a dictionary and increment to next minor version', (done: Mocha.Done) => {
			const newFile = require('./fixtures/updateNewFile.json');
			chai
				.request(app)
				.put(`/dictionaries/${nextId}/schemas`)
				.send(newFile)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.version).to.equal('11.1');
					nextId = res.body._id;
					setImmediate(done);
				});
		});

		it('Should successfully update a schema in a dictionary and increment to next major version', (done: Mocha.Done) => {
			const newFile = require('./fixtures/updateNewFile.json');
			chai
				.request(app)
				.put(`/dictionaries/${nextId}/schemas`)
				.query({ major: true })
				.send(newFile)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body.version).to.equal('12.0');
					nextId = res.body._id;
					setImmediate(done);
				});
		});

		it('Should respond with 404 on poorly formatted dictionary_id', (done: Mocha.Done) => {
			const newFile = require('./fixtures/updateNewFile.json');
			chai
				.request(app)
				.put(`/dictionaries/kljadsbflsdafsdakljsdfkp/schemas`)
				.send(newFile)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(404);
					setImmediate(done);
				});
		});
	});

	describe('Dictionary Update version edge cases', () => {
		const firstVersion = '12.02';
		const secondVersion = '13.0';

		// STATE!
		let id: string;
		let nextId: string;

		before((done: Mocha.Done) => {
			const dictRequest = require('./fixtures/createDictionary.json');
			dictRequest.name = 'updateTest';
			dictRequest.version = firstVersion;
			const firstPromise = chai
				.request(app)
				.post('/dictionaries/')
				.send(dictRequest)
				.then((res: Response) => {
					id = res.body._id;
				});
			firstPromise.then(() => {
				const sameDict = require('./fixtures/createDictionary.json');
				sameDict.name = 'updateTest';
				sameDict.version = secondVersion;
				chai
					.request(app)
					.post('/dictionaries/')
					.send(dictRequest)
					.end((_: Error, res: Response) => {
						nextId = res.body._id;
						done();
					});
			});
		});

		it('Should fail to update file as it is not for latest dictionary version', (done: Mocha.Done) => {
			const newFile = require('./fixtures/newFile.json');
			chai
				.request(app)
				.post(`/dictionaries/${id}/schemas`)
				.send(newFile)
				.end((err: Error, res: Response) => {
					expect(err).to.be.null;
					expect(res).to.have.status(400);
					expect(res.body['message']).to.equal('Dictionary that you are trying to update is not the latest version.');
					setImmediate(done);
				});
		});
	});

	after(async () => {
		await mongoose.connection.close();
		await container.stop();
	});
});

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
import { Dictionary, DictionaryMeta, NameValue, Schema, SchemaField, VersionString } from '../../src';

describe('Dictionary Schemas', () => {
	describe('NameValue', () => {
		it('Rejects empty string', () => {
			expect(NameValue.safeParse('').success).false;
		});
		it('Can be string', () => {
			expect(NameValue.safeParse('any').success).true;
			expect(NameValue.safeParse('123').success).true;
			expect(NameValue.safeParse('_').success).true;
			// NOTE: if we want to limit the property names we should explicitly declare those reules, right now all characters are valid and the strings dont have to start with a letter
		});
		it("Can't contain a `.`", () => {
			expect(NameValue.safeParse('asdf.asdf').success).false;
			expect(NameValue.safeParse('.').success).false;
			expect(NameValue.safeParse('.asdf').success).false;
			expect(NameValue.safeParse('adsf.').success).false;
			expect(NameValue.safeParse('\\.').success).false;
		});
	});

	describe('Fields', () => {
		it('Can have no restrictions', () => {
			const fieldString: SchemaField = {
				name: 'some-name',
				valueType: 'string',
			};
			expect(SchemaField.safeParse(fieldString).success, 'String field invalid.').true;
			const fieldNumber: SchemaField = {
				name: 'some-name',
				valueType: 'number',
			};
			expect(SchemaField.safeParse(fieldNumber).success, 'Number field invalid.').true;
			const fieldInteger: SchemaField = {
				name: 'some-name',
				valueType: 'integer',
			};
			expect(SchemaField.safeParse(fieldInteger).success, 'Integer field invalid.').true;
			const fieldBoolean: SchemaField = {
				name: 'some-name',
				valueType: 'boolean',
			};
			expect(SchemaField.safeParse(fieldBoolean).success, 'Boolean field invalid.').true;
		});
		it('Can have a single object restriction', () => {
			const fieldString: SchemaField = {
				name: 'some-name',
				valueType: 'string',
				restrictions: {
					codeList: ['a', 'b', 'c'],
				},
			};
			expect(SchemaField.safeParse(fieldString).success, 'String field invalid.').true;
			const fieldInteger: SchemaField = {
				name: 'some-name',
				valueType: 'integer',
				restrictions: {
					required: true,
				},
			};
			expect(SchemaField.safeParse(fieldInteger).success, 'Integer field invalid.').true;
			const fieldNumber: SchemaField = {
				name: 'some-name',
				valueType: 'number',
				restrictions: {
					required: true,
				},
			};
			expect(SchemaField.safeParse(fieldNumber).success, 'Number field invalid.').true;
			const fieldBoolean: SchemaField = {
				name: 'some-name',
				valueType: 'boolean',
				restrictions: {
					required: true,
				},
			};
			expect(SchemaField.safeParse(fieldBoolean).success, 'Boolean field invalid.').true;
		});
		it('Can have an array of object restrictions', () => {
			const fieldString: SchemaField = {
				name: 'some-name',
				valueType: 'string',
				restrictions: [
					{
						regex: '^[\\w]+$',
					},
					{
						regex: 'hello',
					},
				],
			};
			expect(SchemaField.safeParse(fieldString).success, 'String field invalid.').true;
			const fieldInteger: SchemaField = {
				name: 'some-name',
				valueType: 'integer',
				restrictions: [
					{
						required: true,
					},
					{
						codeList: [1, 2, 3],
					},
				],
			};
			expect(SchemaField.safeParse(fieldInteger).success, 'Integer field invalid.').true;
			const fieldNumber: SchemaField = {
				name: 'some-name',
				valueType: 'number',
				restrictions: [
					{
						required: true,
					},
					{
						codeList: [1, 2, 3],
					},
				],
			};
			expect(SchemaField.safeParse(fieldNumber).success, 'Number field invalid.').true;
			const fieldBoolean: SchemaField = {
				name: 'some-name',
				valueType: 'boolean',
				restrictions: [
					{
						required: true,
					},
					{
						required: false,
					},
				],
			};
			expect(SchemaField.safeParse(fieldBoolean).success, 'Boolean field invalid.').true;
		});
		describe('Delimiter', () => {
			it('Field can have delimiter', () => {
				const field: SchemaField = {
					name: 'some-name',
					valueType: 'string',
					isArray: true,
					delimiter: '|',
				};
				expect(SchemaField.safeParse(field).success).true;
			});
			it('Delimiter values must have minimum length 1', () => {
				const field: SchemaField = {
					name: 'some-name',
					valueType: 'string',
					isArray: true,
					delimiter: '',
				};
				expect(SchemaField.safeParse(field).success).false;
			});
			it('Delimiter value can have multiple characters', () => {
				const field: SchemaField = {
					name: 'some-name',
					valueType: 'string',
					isArray: true,
					delimiter: '-/-',
				};
				expect(SchemaField.safeParse(field).success).true;
			});
			it('Delimiter value can be whitespace', () => {
				const field: SchemaField = {
					name: 'some-name',
					valueType: 'string',
					isArray: true,
					delimiter: '   ',
				};
				expect(SchemaField.safeParse(field).success).true;
			});
		});
	describe ('displayName', () => {
			it('Field can have displayName', () => {
				const field: SchemaField = {
					name: 'some-name',
					displayName: 'Some Name',
					valueType: 'string',
				};
				expect(SchemaField.safeParse(field).success).true;
			});
			it('Field displayName can contain periods unlike name', () => {
					const field: SchemaField = {
						name: 'some-name',
						displayName: 'Some.Name',
						valueType: 'string',
					};
					expect(SchemaField.safeParse(field).success).true;
				});
			it ('Field displayName is optional', () => {
					const field: SchemaField = {
						name: 'some-name',
						valueType: 'string',
					};
					expect(SchemaField.safeParse(field).success).true;
				});
			});
			
	});
	describe('Schema', () => {
		it("Can't have repeated field names", () => {
			const sharedName = 'schemaName';
			const fieldA: SchemaField = {
				name: sharedName,
				valueType: 'boolean',
			};
			const fieldB: SchemaField = {
				name: sharedName,
				valueType: 'string',
			};
			const schema: Schema = {
				name: 'asdf',
				fields: [fieldA, fieldB],
			};
			expect(Schema.safeParse(schema).success).false;
		});
		it('Must have at least one field', () => {
			const sharedName = 'schemaName';
			const fieldA: SchemaField = {
				name: sharedName,
				valueType: 'boolean',
			};
			const schemaFail: Schema = {
				name: 'asdf',
				fields: [],
			};
			const schemaPass: Schema = {
				name: 'asdf',
				fields: [fieldA],
			};
			expect(Schema.safeParse(schemaFail).success).false;
			expect(Schema.safeParse(schemaPass).success).true;
		});


		describe('Schema displayName', () => {
			it('Schema can have displayName', () => {
				const schema: Schema = {
					name: 'schema-name',
					displayName: 'Schema Display Name',
					fields: [
						{
							name: 'field-name',
							valueType: 'string',
						},
					],
				};
				expect(Schema.safeParse(schema).success).true;
			});
			it('Schema displayName can contain periods unlike name', () => {
				const schema: Schema = {
					name: 'schema-name',
					displayName: 'Schema Display Name. With periods.',
					fields: [
						{
							name: 'field-name',
							valueType: 'string',
						},
					],
				};
				expect(Schema.safeParse(schema).success).true;
			});
			it('Schema displayName is optional', () => {
				const schema: Schema = {
					name: 'schema-name',
					fields: [
						{
							name: 'field-name',
							valueType: 'string',
						},
					],
				};
				expect(Schema.safeParse(schema).success).true;
			});
		});
		describe('Schema Restrictions', () => {
			it('uniqueKey - Can have restriction', () => {
				const sharedName = 'schemaName';
				const fieldA: SchemaField = {
					name: sharedName,
					valueType: 'boolean',
				};
				const schema: Schema = {
					name: 'asdf',
					fields: [fieldA],
					restrictions: {
						uniqueKey: [sharedName],
					},
				};
				expect(Schema.safeParse(schema).success).true;
			});
			it('uniqueKey - Schema must have all fields listed', () => {
				const sharedNameA = 'sharedNameA';
				const sharedNameB = 'schemaNameB';
				const fieldPass: SchemaField = {
					name: sharedNameA,
					valueType: 'boolean',
				};
				const fieldFail: SchemaField = {
					name: 'qwerty',
					valueType: 'string',
				};

				const schemaSharedA: Schema = {
					name: 'asdf',
					fields: [fieldPass],
					restrictions: {
						uniqueKey: [sharedNameA],
					},
				};
				const schemaFailSingle: Schema = {
					name: 'asdf',
					fields: [fieldFail],
					restrictions: {
						uniqueKey: [sharedNameA],
					},
				};
				const schemaFailMulti: Schema = {
					name: 'asdf',
					fields: [fieldPass],
					restrictions: {
						uniqueKey: [sharedNameA, sharedNameB],
					},
				};
				const schemaPassMultipleFields: Schema = {
					name: 'asdf',
					fields: [fieldPass, fieldFail],
					restrictions: {
						uniqueKey: [sharedNameA],
					},
				};
				expect(Schema.safeParse(schemaSharedA).success).true;
				expect(Schema.safeParse(schemaFailSingle).success).false;
				expect(Schema.safeParse(schemaFailMulti).success).false;
				expect(Schema.safeParse(schemaPassMultipleFields).success).true;
			});
			it('foreignKey - Can have restriction', () => {
				const foreignFieldName = 'foreignField';
				const foreignSchemaName = 'foreignSchema';

				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const schema: Schema = {
					name: 'localSchema',
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: foreignSchemaName,
								mappings: [
									{
										local: localFieldName,
										foreign: foreignFieldName,
									},
								],
							},
						],
					},
				};

				expect(Schema.safeParse(schema).success).true;
			});
			it('foreignKey - Rejects if uses same schema name', () => {
				const foreignFieldName = 'foreignField';

				const schemaName = 'reusedName';
				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const schema: Schema = {
					name: schemaName,
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: schemaName,
								mappings: [
									{
										local: localFieldName,
										foreign: foreignFieldName,
									},
								],
							},
						],
					},
				};
				expect(Schema.safeParse(schema).success).false;
			});
			it('foreignKey - Rejects if local field does not exist', () => {
				const foreignFieldName = 'foreignField';
				const foreignSchemaName = 'foreignSchema';

				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const schema: Schema = {
					name: 'localSchema',
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: foreignSchemaName,
								mappings: [
									{
										local: 'unknownName',
										foreign: foreignFieldName,
									},
								],
							},
						],
					},
				};

				expect(Schema.safeParse(schema).success).false;
			});
		});
	});
	describe('Version String', () => {
		it('Rejects empty string', () => {
			expect(VersionString.safeParse('').success).false;
		});
		it('Accepts valid version strings', () => {
			expect(VersionString.safeParse('0.0').success).true;
			expect(VersionString.safeParse('1.0').success).true;
			expect(VersionString.safeParse('1.1').success).true;
			expect(VersionString.safeParse('10.10').success).true;
			expect(VersionString.safeParse('234.567').success).true;
		});
		it('Rejects single number strings', () => {
			expect(VersionString.safeParse('0').success).false;
			expect(VersionString.safeParse('1').success).false;
			expect(VersionString.safeParse('10').success).false;
			expect(VersionString.safeParse('123').success).false;
		});
		it('Rejects other invalid strings', () => {
			expect(VersionString.safeParse('1-2').success).false;
			expect(VersionString.safeParse('1.2.3').success).false;
			expect(VersionString.safeParse('1.2.').success).false;
			expect(VersionString.safeParse('one dot two').success).false;
		});
	});
	describe('Dictionary', () => {
		it("Can't have repeated schema names", () => {
			const sharedName = 'asdf';
			const schemaA: Schema = {
				name: sharedName,
				fields: [
					{
						name: 'aName',
						valueType: 'boolean',
					},
				],
			};
			const schemaB: Schema = {
				name: sharedName,
				fields: [
					{
						name: 'bName',
						valueType: 'boolean',
					},
				],
			};
			const dictionary: Dictionary = {
				name: 'dictionaryName',
				version: '1.0',
				schemas: [schemaA, schemaB],
			};
			expect(Dictionary.safeParse(dictionary).success).false;
		});
		describe('ForeignKey Restrictions', () => {
			it('Validates that foreign schema exists in dictionary', () => {
				const foreignFieldName = 'foreignField';
				const foreignSchemaName = 'foreignSchema';
				const foreignField: SchemaField = {
					name: foreignFieldName,
					valueType: 'boolean',
				};
				const foreignSchema: Schema = {
					name: foreignSchemaName,
					fields: [foreignField],
				};

				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const localSchema: Schema = {
					name: 'localSchema',
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: foreignSchemaName,
								mappings: [
									{
										local: localFieldName,
										foreign: foreignFieldName,
									},
								],
							},
						],
					},
				};

				// should pass
				const dictionaryWithForeignSchema: Dictionary = {
					name: 'dictionaryName',
					schemas: [localSchema, foreignSchema],
					version: '1.0',
				};
				expect(Dictionary.safeParse(dictionaryWithForeignSchema).success).true;

				// should fail
				const dictionaryWithoutForeignSchema: Dictionary = {
					name: 'dictionaryName',
					schemas: [localSchema],
					version: '1.0',
				};
				expect(Dictionary.safeParse(dictionaryWithoutForeignSchema).success).false;
			});
			it('Fails when foreign field does not exists in foreign schema', () => {
				const foreignSchemaName = 'foreignSchema';
				const foreignField: SchemaField = {
					name: 'foreignField',
					valueType: 'boolean',
				};
				const foreignSchema: Schema = {
					name: foreignSchemaName,
					fields: [foreignField],
				};

				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const localSchema: Schema = {
					name: 'localSchema',
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: foreignSchemaName,
								mappings: [
									{
										local: localFieldName,
										foreign: 'invalidField',
									},
								],
							},
						],
					},
				};

				const dictionary: Dictionary = {
					name: 'dictionaryName',
					schemas: [localSchema, foreignSchema],
					version: '1.0',
				};
				expect(Dictionary.safeParse(dictionary).success).false;
			});
			it('Fails when mapped between fields of different types', () => {
				const foreignSchemaName = 'foreignSchema';
				const foreignFieldName = 'foreignField';
				const foreignField: SchemaField = {
					name: foreignFieldName,
					valueType: 'string',
				};
				const foreignSchema: Schema = {
					name: foreignSchemaName,
					fields: [foreignField],
				};

				const localFieldName = 'localField';
				const localField: SchemaField = {
					name: localFieldName,
					valueType: 'boolean',
				};
				const localSchema: Schema = {
					name: 'localSchema',
					fields: [localField],
					restrictions: {
						foreignKey: [
							{
								schema: foreignSchemaName,
								mappings: [
									{
										local: localFieldName,
										foreign: foreignFieldName,
									},
								],
							},
						],
					},
				};

				const dictionary: Dictionary = {
					name: 'dictionaryName',
					schemas: [localSchema, foreignSchema],
					version: '1.0',
				};
				expect(Dictionary.safeParse(dictionary).success).false;
			});
		});
	});
	describe('Meta', () => {
		it('Can accept non-nested values', () => {
			const meta = { a: 'string', b: 123, c: true };
			expect(DictionaryMeta.safeParse(meta).success).true;
		});
		it('Can accept nested values', () => {
			const singleNested = { a: 'string', b: 123, c: true, nested: { d: 'asdf' } };
			const doubleNested = { a: 'string', b: 123, c: true, nested: { d: 'asdf', nested2: { e: 'asdf' } } };
			expect(DictionaryMeta.safeParse(singleNested).success).true;
			expect(DictionaryMeta.safeParse(doubleNested).success).true;
		});
		it('Can accept arrays of strings', () => {
			const meta = { a: 'string', b: 123, c: true, array: ['asdf', 'qwerty'] };
			expect(DictionaryMeta.safeParse(meta).success).true;
		});
		it('Can accept arrays of numbers', () => {
			const meta = { a: 'string', b: 123, c: true, array: [123, 456, 789] };
			expect(DictionaryMeta.safeParse(meta).success).true;
		});
		it('Cannot accept arrays of booleans', () => {
			// This constraint feels a bit arbitrary but I can't imagine a clear use case for this.
			// Could be changed with discussion
			const meta = { a: 'string', b: 123, c: true, array: [true, false, true, false] };
			expect(DictionaryMeta.safeParse(meta).success).false;
		});
		it('Cannot accept arrays of mixed types', () => {
			const meta = { a: 'string', b: 123, c: true, array: ['asdf', 123] };
			expect(DictionaryMeta.safeParse(meta).success).false;
		});
	});
});

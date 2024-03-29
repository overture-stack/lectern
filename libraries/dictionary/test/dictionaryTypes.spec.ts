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
import {
	BooleanFieldRestrictions,
	Dictionary,
	Integer,
	IntegerFieldRestrictions,
	NameString,
	NumberFieldRestrictions,
	RestrictionIntegerRange,
	RestrictionNumberRange,
	Schema,
	SchemaField,
	StringFieldRestrictions,
} from '../src';

describe('Dictionary Types', () => {
	describe('NameString', () => {
		it("Can't be empty string", () => {
			expect(NameString.safeParse('').success).false;
		});
		it('Can be string', () => {
			expect(NameString.safeParse('any').success).true;
			expect(NameString.safeParse('123').success).true;
			expect(NameString.safeParse('_').success).true;
			// NOTE: if we want to limit the property names we should explicitly declare those reules, right now all characters are valid and the strings dont have to start with a letter
		});
		it("Can't contain a `.`", () => {
			expect(NameString.safeParse('asdf.asdf').success).false;
			expect(NameString.safeParse('.').success).false;
			expect(NameString.safeParse('.asdf').success).false;
			expect(NameString.safeParse('adsf.').success).false;
			expect(NameString.safeParse('\\.').success).false;
		});
	});

	describe('Integer', () => {
		it("Can't be float", () => {
			expect(Integer.safeParse(1.3).success).false;
			expect(Integer.safeParse(2.0000001).success).false;
			// Note: float precision issues, if the float resolves to a whole number the value will be accepted.
		});
		it("Can't be string, boolean, object, array", () => {
			expect(Integer.safeParse('1').success).false;
			expect(Integer.safeParse(true).success).false;
			expect(Integer.safeParse([1]).success).false;
			expect(Integer.safeParse({}).success).false;
			expect(Integer.safeParse({ thing: 1 }).success).false;
		});
		it('Can be integer', () => {
			expect(Integer.safeParse(1).success).true;
			expect(Integer.safeParse(0).success).true;
			expect(Integer.safeParse(-1).success).true;
			expect(Integer.safeParse(1123).success).true;
		});
	});
	describe('RangeRestriction', () => {
		it("Integer Range Can't have exclusiveMin and Min", () => {
			expect(RestrictionIntegerRange.safeParse({ exclusiveMin: 0, min: 0 }).success).false;
			expect(RestrictionIntegerRange.safeParse({ min: 0 }).success).true;
			expect(RestrictionIntegerRange.safeParse({ exclusiveMin: 0 }).success).true;
		});
		it("Integer Range Can't have exclusiveMax and Max", () => {
			expect(RestrictionIntegerRange.safeParse({ exclusiveMax: 0, max: 0 }).success).false;
			expect(RestrictionIntegerRange.safeParse({ max: 0 }).success).true;
			expect(RestrictionIntegerRange.safeParse({ exclusiveMax: 0 }).success).true;
		});
		it("Number Range Can't have exclusiveMin and Min", () => {
			expect(RestrictionNumberRange.safeParse({ exclusiveMin: 0, min: 0 }).success).false;
			expect(RestrictionNumberRange.safeParse({ min: 0 }).success).true;
			expect(RestrictionNumberRange.safeParse({ exclusiveMin: 0 }).success).true;
		});
		it("Number Range Can't have exclusiveMax and Max", () => {
			expect(RestrictionNumberRange.safeParse({ exclusiveMax: 0, max: 0 }).success).false;
			expect(RestrictionNumberRange.safeParse({ max: 0 }).success).true;
			expect(RestrictionNumberRange.safeParse({ exclusiveMax: 0 }).success).true;
		});
	});
	describe('RegexRestriction', () => {
		it('Accepts valid regex', () => {
			expect(StringFieldRestrictions.safeParse({ regex: '[a-zA-Z]' }).success).true;
			expect(
				StringFieldRestrictions.safeParse({
					regex: '^({((([WUBRG]|([0-9]|[1-9][0-9]*))(/[WUBRG])?)|(X)|([WUBRG](/[WUBRG])?/[P]))})+$',
				}).success,
			).true;
		});
		it('Rejects invalid regex', () => {
			expect(StringFieldRestrictions.safeParse({ regex: '[' }).success).false;
		});
	});
	describe('UniqueRestriction', () => {
		it('All fields accept unique restriction', () => {
			expect(StringFieldRestrictions.safeParse({ unique: true }).success).true;
			expect(NumberFieldRestrictions.safeParse({ unique: true }).success).true;
			expect(IntegerFieldRestrictions.safeParse({ unique: true }).success).true;
			expect(BooleanFieldRestrictions.safeParse({ unique: true }).success).true;
		});
	});
	describe('ScriptRestriction', () => {
		it('All fields accept script restriction', () => {
			expect(StringFieldRestrictions.safeParse({ script: ['()=>true'] }).success).true;
			expect(NumberFieldRestrictions.safeParse({ script: ['()=>true'] }).success).true;
			expect(IntegerFieldRestrictions.safeParse({ script: ['()=>true'] }).success).true;
			expect(BooleanFieldRestrictions.safeParse({ script: ['()=>true'] }).success).true;
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
});

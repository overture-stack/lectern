/*
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
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
import { Schema, SchemaField } from '../../src';

describe('Schema Types', () => {
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
		describe('uniqueKey', () => {
			it('Can have restriction', () => {
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
			it('Schema must have all fields listed', () => {
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
		});
		describe('foreignKey', () => {
			it('Can have restriction', () => {
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
			it('Rejects if uses same schema name', () => {
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
			it('Rejects if local field does not exist', () => {
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
});

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

import { Dictionary, Schema, SchemaField } from '../../src';

describe('Dictionary Types', () => {
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

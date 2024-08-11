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

import assert from 'assert';
import { expect } from 'chai';
import {
	Integer,
	RestrictionIntegerRange,
	RestrictionNumberRange,
	SchemaBooleanField,
	SchemaField,
	SchemaIntegerField,
	SchemaNumberField,
	SchemaStringField,
	StringFieldRestrictions,
	type ConditionalRestriction,
	type StringFieldRestrictionsObject,
} from '../../src';

describe('Restriction Schemas', () => {
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
		it('All fields accept unique property', () => {
			expect(SchemaBooleanField.safeParse({ name: 'name', valueType: 'boolean', unique: true }).success).true;
			expect(SchemaIntegerField.safeParse({ name: 'name', valueType: 'integer', unique: true }).success).true;
			expect(SchemaNumberField.safeParse({ name: 'name', valueType: 'number', unique: true }).success).true;
			expect(SchemaStringField.safeParse({ name: 'name', valueType: 'string', unique: true }).success).true;
		});
	});

	describe('ConditionalRestrictions', () => {
		// These parsing functions seem unnecessary but they are checking for a failure case that was found:
		// The restrictions property is a union between a restrictions object and conditional restriction schema,
		//  and the restriction object has all optional fields, so it will match with a conditional restriction
		//  object successfully and strip out the if/then/else properties. To avoid this scenario, the RestrictionObject
		//  schemas make the restriction validation `strict()`. These parsing tests are ensuring that this behaviour
		//  is not changed.

		it('Parses single conditional restriction', () => {
			const restrictions: ConditionalRestriction<StringFieldRestrictions> = {
				if: {
					conditions: [{ fields: ['another-field'], match: { value: 'asdf' } }],
				},
				then: { required: true },
				else: { empty: true },
			};
			const field: SchemaStringField = {
				name: 'example-string',
				valueType: 'string',
				restrictions,
			};
			const parseResult = SchemaField.safeParse(field);
			expect(parseResult.success).true;
			assert(parseResult.success === true);

			expect(parseResult.data).deep.equal(field);
		});

		it('Parses conditional restrictions in an array', () => {
			const restrictions: Array<StringFieldRestrictionsObject> = [
				{ codeList: ['value1', 'value2'] },
				{
					if: {
						conditions: [{ fields: ['another-field'], match: { value: 'asdf' } }],
					},
					then: { required: true },
					else: { empty: true },
				},
			];
			const field: SchemaStringField = {
				name: 'example-string',
				valueType: 'string',
				restrictions,
			};
			const parseResult = SchemaField.safeParse(field);
			expect(parseResult.success).true;
			assert(parseResult.success === true);

			expect(parseResult.data).deep.equal(field);
		});

		it('Parses nested conditional restrictions', () => {
			const restrictions: Array<StringFieldRestrictionsObject> = [
				{ codeList: ['value1', 'value2'] },
				{
					if: {
						conditions: [{ fields: ['first-dependent-field'], match: { value: 'asdf' } }],
					},
					then: [
						{
							if: {
								conditions: [{ fields: ['second-dependent-field'], match: { range: { max: 10, min: 0 } } }],
							},
							then: { required: true },
							else: { empty: true },
						},
						{
							if: {
								conditions: [{ fields: ['third-dependent-field'], match: { range: { max: 10, min: 0 } } }],
							},
							then: { regex: 'asdf' },
							else: { codeList: ['a', 's', 'd', 'f'] },
						},
					],
					else: { empty: true },
				},
			];
			const field: SchemaStringField = {
				name: 'example-string',
				valueType: 'string',
				restrictions,
			};
			const parseResult = SchemaField.safeParse(field);
			expect(parseResult.success).true;
			assert(parseResult.success === true);

			expect(parseResult.data).deep.equal(field);
		});
	});
});

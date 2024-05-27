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
import {
	BooleanFieldRestrictions,
	IntegerFieldRestrictions,
	NumberFieldRestrictions,
	RestrictionIntegerRange,
	RestrictionNumberRange,
	SchemaBooleanField,
	SchemaIntegerField,
	SchemaNumberField,
	SchemaStringField,
	StringFieldRestrictions,
} from '../../src';

describe('SchemaField Types', () => {
	describe('Restrictions as arrays', () => {
		it('Boolean restrictions can be arrays', () => {
			const field: SchemaBooleanField = {
				name: 'boolean_field',
				valueType: 'boolean',
				restrictions: [{ required: true }, { unique: true }],
			};
			expect(SchemaBooleanField.safeParse(field).success).true;
		});
		it('Integer restrictions can be arrays', () => {
			const field: SchemaIntegerField = {
				name: 'integer_field',
				valueType: 'integer',
				restrictions: [{ required: true }, { range: { min: 12, max: 34 } }],
			};
			expect(SchemaIntegerField.safeParse(field).success).true;
		});
		it('Number restrictions can be arrays', () => {
			const field: SchemaNumberField = {
				name: 'number_field',
				valueType: 'number',
				restrictions: [{ required: true }, { range: { min: 12, max: 34 } }],
			};
			expect(SchemaNumberField.safeParse(field).success).true;
		});
		it('String restrictions can be arrays', () => {
			const field: SchemaStringField = {
				name: 'string_field',
				valueType: 'string',
				restrictions: [{ required: true }, { codeList: ['a', 'b', 'c'] }],
			};
			expect(SchemaStringField.safeParse(field).success).true;
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
	describe('ScriptRestriction - Removed', () => {
		// Script restrictions have been removed, this ensures they aren't still available
		it('No fields accept script restriction', () => {
			expect(StringFieldRestrictions.safeParse({ script: ['()=>true'] }).success).false;
			expect(NumberFieldRestrictions.safeParse({ script: ['()=>true'] }).success).false;
			expect(IntegerFieldRestrictions.safeParse({ script: ['()=>true'] }).success).false;
			expect(BooleanFieldRestrictions.safeParse({ script: ['()=>true'] }).success).false;
		});
	});
});

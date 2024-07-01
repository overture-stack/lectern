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

import type { SchemaFieldValueType } from 'dictionary';
import type { FieldRestrictionRule } from './FieldRestrictionRule';
import type { RestrictionTestInvalidInfo } from './FieldRestrictionTest';

export type FieldValidationErrorRestrictionInfo = RestrictionTestInvalidInfo & {
	restriction: FieldRestrictionRule;
};

// export type FieldValidationErrorEmpty = {
// 	reason: 'VALUE_MUST_BE_EMPTY';
// };
// export type FieldValidationErrorRequired = {
// 	reason: 'VALUE_IS_REQUIRED';
// };

export type FieldValidationErrorRestrictions = {
	reason: 'INVALID_BY_RESTRICTION';
	errors: Array<FieldValidationErrorRestrictionInfo>;
};

/**
 * This is the result when the value does not match the value type defined in the field. The properties
 * `valueType` and `isArray` are the expected type values as defined in the field definition.
 */
export type FieldValidationErrorValueType = {
	reason: 'INVALID_VALUE_TYPE';
	valueType: SchemaFieldValueType;
	isArray: boolean;
};

export type FieldValidationError =
	// | FieldValidationErrorEmpty
	// | FieldValidationErrorRequired
	FieldValidationErrorRestrictions | FieldValidationErrorValueType;

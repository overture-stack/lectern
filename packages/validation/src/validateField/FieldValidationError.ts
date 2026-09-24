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

import type { SchemaFieldValueType } from '@overture-stack/lectern-dictionary';
import type { FieldRestrictionRule } from '../validateField/FieldRestrictionRule';
import type { RestrictionTestInvalidInfo } from '../validateField/FieldRestrictionTest';

/**
 * Information for an error validating a field against a restriction. Includes a restriction rule
 * paired with the details of why it failed.
 */
export type FieldValidationErrorRestrictionInfo = RestrictionTestInvalidInfo & {
	restriction: FieldRestrictionRule;
};

/**
 * Error for a field value that fails one or more restriction rules (codeList, regex, range, etc.).
 * `errors` lists each individual restriction that was violated.
 */
export type FieldValidationErrorRestrictions = {
	reason: 'INVALID_BY_RESTRICTION';
	errors: Array<FieldValidationErrorRestrictionInfo>;
};

/**
 * Validation error for a field value that does not match the field's declared `valueType` or
 * `isArray`.
 */
export type FieldValidationErrorValueType = {
	reason: 'INVALID_VALUE_TYPE';
	valueType: SchemaFieldValueType;
	isArray: boolean;
};

/**
 * A field-level validation error. Narrow on `reason` to access the specific error properties.
 */
export type FieldValidationError = FieldValidationErrorRestrictions | FieldValidationErrorValueType;

/**
 * All `reason` values for a `FieldValidationError`.
 */
export type FieldValidationErrorReason = FieldValidationError['reason'];

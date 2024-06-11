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

import type { Values, Singular } from 'common';
import type { DataRecord, DataRecordValue } from '../../types/dataRecords';
import type { RestrictionRange } from 'dictionary';

/**
 * Represents the common structure of a validation error without the custom content provided by specific error types.
 * The `message` property is not included here as this allows the rest of the error content to be passed to a message building function
 * that will produce the final typed SchemaValidationError
 */
export type BaseSchemaValidationError = {
	index: number;
	fieldName: string;
};

type GenericSchemaValidationError<
	ErrorType extends SchemaValidationErrorType,
	Info extends object,
> = BaseSchemaValidationError & {
	errorType: ErrorType;
	info: Info;
	message: string;
};

// Common string for invalid value errors
export const INVALID_VALUE_ERROR_MESSAGE = 'The value is not permissible for this field.';

export const SchemaValidationErrorTypes = {
	INVALID_FIELD_VALUE_TYPE: 'INVALID_FIELD_VALUE_TYPE',
	INVALID_BY_REGEX: 'INVALID_BY_REGEX',
	INVALID_BY_RANGE: 'INVALID_BY_RANGE',
	INVALID_BY_SCRIPT: 'INVALID_BY_SCRIPT',
	INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
	INVALID_BY_UNIQUE: 'INVALID_BY_UNIQUE',
	INVALID_BY_FOREIGN_KEY: 'INVALID_BY_FOREIGN_KEY',
	INVALID_BY_UNIQUE_KEY: 'INVALID_BY_UNIQUE_KEY',
	MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
	UNRECOGNIZED_FIELD: 'UNRECOGNIZED_FIELD',
} as const;
export type SchemaValidationErrorType = Values<typeof SchemaValidationErrorTypes>;

export type EnumValueValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_ENUM_VALUE,
	{ value: DataRecordValue[] }
>;
export type ForeignKeyValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_FOREIGN_KEY,
	{ value: DataRecord; foreignSchema: string }
>;
export type MissingRequiredFieldValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.MISSING_REQUIRED_FIELD,
	{}
>;
export type RangeValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_RANGE,
	{ value: number[] } & RestrictionRange
>;
export type RegexValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_REGEX,
	{ value: string[]; regex: string; examples?: string }
>;
export type ScriptValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_SCRIPT,
	{ message: string; value: DataRecordValue }
>;
export type UniqueValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_UNIQUE,
	{ value: DataRecordValue }
>;
export type UniqueKeyValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_BY_UNIQUE_KEY,
	{ uniqueKeyFields: string[]; value: DataRecord }
>;
export type UnrecognizedFieldValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.UNRECOGNIZED_FIELD,
	{}
>;
export type ValueTypeValidationError = GenericSchemaValidationError<
	typeof SchemaValidationErrorTypes.INVALID_FIELD_VALUE_TYPE,
	{ value: Singular<DataRecordValue>[] }
>;
export type SchemaValidationError =
	| EnumValueValidationError
	| ValueTypeValidationError
	| ForeignKeyValidationError
	| MissingRequiredFieldValidationError
	| RangeValidationError
	| RegexValidationError
	| ScriptValidationError
	| UniqueValidationError
	| UniqueKeyValidationError
	| UnrecognizedFieldValidationError;

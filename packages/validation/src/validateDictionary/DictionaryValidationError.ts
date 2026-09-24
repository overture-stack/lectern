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

import type { FieldDetails } from '../validateRecord';
import type { SchemaRecordError, SchemaValidationRecordErrorDetails } from '../validateSchema';

/**
 * Shared properties for all dictionary validation errors. Carries the name of the schema
 * being validated.
 */
export type DictionaryValidationErrorBase = {
	schemaName: string;
};

/**
 * Error for a record submitted for a schema name that does not exist in the dictionary.
 */
export type DictionaryValidationErrorUnrecognizedSchema = DictionaryValidationErrorBase & {
	reason: 'UNRECOGNIZED_SCHEMA';
};

/**
 * Error for a field value that fails a foreign key constraint; `foreignSchema` identifies the
 * referenced schema and field that the value must exist in.
 */
export type DictionaryValidationErrorRecordForeignKey = FieldDetails & {
	reason: 'INVALID_BY_FOREIGNKEY';
	foreignSchema: {
		schemaName: string;
		fieldName: string;
	};
};

/**
 * All error detail types that can appear on a record when validating against a dictionary,
 * including foreign key errors.
 */
export type DictionaryValidationRecordErrorDetails =
	| SchemaValidationRecordErrorDetails
	| DictionaryValidationErrorRecordForeignKey;

/**
 * Error for a schema submission that contains one or more invalid records; `invalidRecords` contains a list of
 * record validation errors grouped by record.
 */
export type DictionaryValidationErrorInvalidRecords = DictionaryValidationErrorBase & {
	reason: 'INVALID_RECORDS';
	invalidRecords: SchemaRecordError<DictionaryValidationRecordErrorDetails>[];
};

/**
 * A dictionary-level validation error. Narrow on `reason` to access the specific error properties.
 */
export type DictionaryValidationError =
	| DictionaryValidationErrorUnrecognizedSchema
	| DictionaryValidationErrorInvalidRecords;

/**
 * All `reason` values for a `DictionaryValidationError`.
 */
export type DictionaryValidationErrorReason = DictionaryValidationError['reason'];

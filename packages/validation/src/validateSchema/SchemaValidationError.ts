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

import type { DataRecord } from '@overture-stack/lectern-dictionary';
import type { RecordValidationError, FieldDetails } from '../validateRecord';

/**
 * Error for a record that violates a `uniqueKey` constraint. `uniqueKey` holds the conflicting
 * composite key values; `matchingRecords` lists indices of records sharing that key.
 */
export type SchemaValidationRecordErrorUniqueKey = {
	reason: 'INVALID_BY_UNIQUE_KEY';
	uniqueKey: DataRecord;
	matchingRecords: number[];
};

/**
 * Error for a Record where a field value that violates a `unique` constraint.
 * `matchingRecords` lists the indices of records with the same value in the specified field.
 */
export type SchemaValidationRecordErrorUnique = FieldDetails & {
	reason: 'INVALID_BY_UNIQUE';
	matchingRecords: number[];
};

/**
 * All error detail types that can appear on a record when validating against a schema.
 */
export type SchemaValidationRecordErrorDetails =
	| RecordValidationError
	| SchemaValidationRecordErrorUnique
	| SchemaValidationRecordErrorUniqueKey;

/**
 * Pairing of a record's position in the submitted data alongside the validation errors it produced.
 */
export type SchemaRecordError<ErrorDetails> = {
	recordIndex: number;
	recordErrors: ErrorDetails[];
};

/**
 * Error produced when validating a set of records against a schema. Groups per-record errors by
 * their index in the submitted data.
 */
export type SchemaValidationError = SchemaRecordError<SchemaValidationRecordErrorDetails>;

/**
 * All `reason` values across schema-level record errors.
 */
export type SchemaValidationErrorReason = SchemaValidationRecordErrorDetails['reason'];

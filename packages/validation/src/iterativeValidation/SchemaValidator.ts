/*
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
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

import { TypeUtils, success, type DataRecord, type Result, type Schema } from '@overture-stack/lectern-dictionary';
import { invalid, valid, type TestResult } from '../types';
import type { RecordValidationError } from '../validateRecord/RecordValidationError';
import { validateRecord } from '../validateRecord/validateRecord';
import {
	CrossRecordValidator,
	type CrossRecordErrorCounts,
	type CrossRecordValidationError,
} from './CrossRecordValidator';
import type { SubmittedRecordId, ValidatorRecordEntry } from './submissionTypes';

/**
 * Per-record errors returned from `submit()` for a record that failed field or record-level validation.
 */
export type SchemaValidatorRecordTestResult = {
	id: SubmittedRecordId;
} & TestResult<RecordValidationError[]>;

/**
 * Aggregated report from the SchemaValidator.
 */
export type SchemaValidatorReport = {
	/**
	 * Total number of records successfully submitted (excluding duplicates).
	 */
	recordCount: number;

	/**
	 * Number of records that had one or more field or record-level validation errors.
	 */
	recordErrorCount: number;

	/**
	 * Aggregated counts of cross-record constraint violations.
	 */
	crossRecordErrorCounts: CrossRecordErrorCounts;
};

/**
 * SchemaValidator combines per-record validation with cross-record constraint checking for a single schema.
 *
 * Per-record errors (field type errors, restriction failures, unrecognized fields) are returned
 * directly from `submit()`. Cross-record violations (`unique`, `uniqueKey`) are tracked in a lightweight
 * internal index and exposed via `report()` and `errors()`.
 *
 * Lifecycle: `new SchemaValidator(schema)` -> `submit()` -> `report()` / `errors()`
 *
 * - `submit()` returns `success` with any per-record errors found, or `failure` if the record
 *   was rejected (duplicate ID or locked state).
 * - `report()` returns aggregate counts only; it never blocks.
 * - `errors()` yields detailed cross-record violation objects one at a time and locks `submit()`
 *   for the duration of iteration.
 *
 * @example
 * const validator = new SchemaValidator(schema);
 *
 * for (const [rowIndex, record] of records.entries()) {
 *   const result = validator.submit({ id: String(rowIndex), data: record });
 *   if (result.success) {
 *     for (const { id, valid, details } of result.data) {
 *       if (!valid) { console.warn(`Row ${id} has ${details.length} error(s)`); }
 *     }
 *   } else {
 *     console.warn(`Row ${rowIndex} skipped: ${result.data.error}`);
 *   }
 * }
 *
 * const report = validator.report();
 * if (!report.valid) {
 *   for (const error of validator.errors()) {
 *     console.error(error);
 *   }
 * }
 */
export class SchemaValidator {
	private readonly schema: Schema;
	private readonly crossRecordValidator: CrossRecordValidator;
	private recordCount: number;
	private recordErrorCount: number;

	constructor(schema: Schema) {
		this.schema = schema;
		this.crossRecordValidator = new CrossRecordValidator(schema);
		this.recordCount = 0;
		this.recordErrorCount = 0;
	}

	private processEntry(
		id: string,
		data: DataRecord,
	): Result<SchemaValidatorRecordTestResult, { error: 'DUPLICATE_ID' | 'LOCKED' }> {
		const crossRecordResult = this.crossRecordValidator.submit({ id, data });
		if (!crossRecordResult.success) {
			return crossRecordResult;
		}

		this.recordCount++;

		const validationResult = validateRecord(data, this.schema);
		if (!validationResult.valid) {
			this.recordErrorCount++;
		}

		return success({ id, ...validationResult });
	}

	/**
	 * Submit one or more records for validation.
	 *
	 * Each record is immediately validated against the schema and its relevant field values
	 * are added to the cross-record index. Per-record errors are returned in the success data
	 * and never stored internally.
	 *
	 * - Returns `failure` with `DUPLICATE_ID` if any submitted ID was already seen.
	 * - Returns `failure` with `LOCKED` if the `errors()` generator is currently active.
	 * - In batch submission, if any entry fails the call immediately returns the failure and
	 * no further entries in that batch are processed.
	 */
	submit(
		entry: ValidatorRecordEntry | ValidatorRecordEntry[],
	): Result<SchemaValidatorRecordTestResult[], { error: 'DUPLICATE_ID' | 'LOCKED' }> {
		const entries = TypeUtils.asArray(entry);
		const recordErrors: SchemaValidatorRecordTestResult[] = [];

		for (const { id, data } of entries) {
			const result = this.processEntry(id, data);
			if (!result.success) {
				return result;
			}
			recordErrors.push(result.data);
		}

		return success(recordErrors);
	}

	/**
	 * Generate a report of all validation results seen so far.
	 *
	 * - Returns `valid()` when `recordErrorCount` is zero and no cross-record violations were found.
	 * - Returns `invalid({ details })` with aggregate counts otherwise.
	 */
	report(): TestResult<SchemaValidatorReport> {
		const crossRecordReport = this.crossRecordValidator.report();
		const details: SchemaValidatorReport = {
			recordCount: this.recordCount,
			recordErrorCount: this.recordErrorCount,
			crossRecordErrorCounts: crossRecordReport.errorCounts,
		};

		const isValid = this.recordErrorCount === 0 && crossRecordReport.valid;

		if (isValid) {
			return valid();
		}
		return invalid(details);
	}

	/**
	 * Generator that yields one error object per record that violates a `unique` or `uniqueKey`
	 * constraint. Delegates to the internal `CrossRecordValidator`.
	 *
	 * Locks `submit()` for the duration of iteration.
	 */
	*errors(): Generator<CrossRecordValidationError> {
		yield* this.crossRecordValidator.errors();
	}
}

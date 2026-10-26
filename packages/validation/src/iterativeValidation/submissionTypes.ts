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

import type { DataRecord } from '@overture-stack/lectern-dictionary';

/**
 * The string identifier used to uniquely identify a submitted record within a dataset.
 * This can be a row number, a primary key value, or any other string that uniquely
 * identifies the record within the submission being validated.
 */
export type SubmittedRecordId = string;

/**
 * A record submission entry pairing a record with its identifier.
 * Passed to the `submit()` method of any iterative validator.
 */
export type ValidatorRecordEntry = {
	id: SubmittedRecordId;
	data: DataRecord;
};

/**
 * Construction options shared by all iterative validators.
 */
export type ValidatorOptions = {
	/**
	 * When `true`, `submit()` returns a `DUPLICATE_ID` failure for any record whose ID was already
	 * submitted, and the duplicate record is not processed.
	 *
	 * Rejecting duplicates has a memory cost: every submitted ID is retained for the lifetime of the
	 * validator so that later submissions can be checked against it. For large datasets this set
	 * grows with the number of records submitted.
	 *
	 * When `false`, IDs are not retained and duplicate IDs are accepted. Each duplicate is treated as
	 * a separate submission, so a record submitted twice will conflict with itself and be reported
	 * as violating any `unique` or `uniqueKey` constraint on its schema.
	 *
	 * Defaults to `false`.
	 */
	rejectDuplicates?: boolean;
};

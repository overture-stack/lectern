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

import { DataRecord, UnprocessedDataRecord, Schema } from '@overture-stack/lectern-dictionary';
import { SchemaValidationError } from './validationErrorTypes';

// these validation functions run AFTER the record has been converted to the correct types from raw strings
export type UnprocessedRecordValidationFunction = (
	record: UnprocessedDataRecord,
	index: number,
	schemaFields: Schema['fields'],
) => Array<SchemaValidationError>;

// these validation functions run BEFORE the record has been converted to the correct types from raw strings
export type ValidationFunction = (
	record: DataRecord,
	index: number,
	schemaFields: Schema['fields'],
) => Array<SchemaValidationError>;

// these validation functions run AFTER the records has been converted to the correct types from raw strings, and apply to a dataset instead of
// individual records
export type DatasetValidationFunction = (data: Array<DataRecord>, schema: Schema) => Array<SchemaValidationError>;

export type CrossSchemaValidationFunction = (
	schema: Schema,
	data: Record<string, DataRecord[]>,
) => Array<SchemaValidationError>;

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

import {
	SchemaValidationError,
	type ParseRecordFailureData,
	type DictionaryValidationError,
	type RecordValidationError,
	type ParseSchemaFailureData,
	type ParseDictionaryData,
} from '@overture-stack/lectern-validation';
import { DataRecord, Schema } from 'dictionary';

export type ProcessingFunction = (schema: Schema, rec: Readonly<DataRecord>, index: number) => any;

type RecordProcessingErrorSuccess = {
	status: 'SUCCESS';
	record: DataRecord;
};
type RecordProcessingErrorParsing = ParseRecordFailureData & {
	status: 'ERROR_PARSING';
};
type RecordProcessingErrorValidation = {
	status: 'ERROR_VALIDATION';
	record: DataRecord;
	errors: RecordValidationError[];
};
export type RecordProcessingResult =
	| RecordProcessingErrorSuccess
	| RecordProcessingErrorParsing
	| RecordProcessingErrorValidation;

type SchemaProcessingErrorSuccess = {
	status: 'SUCCESS';
	records: DataRecord[];
};
type SchemaProcessingErrorParsing = ParseSchemaFailureData & {
	status: 'ERROR_PARSING';
};
type SchemaProcessingErrorValidation = {
	status: 'ERROR_VALIDATION';
	records: DataRecord[];
	errors: SchemaValidationError[];
};
export type SchemaProcessingResult =
	| SchemaProcessingErrorSuccess
	| SchemaProcessingErrorParsing
	| SchemaProcessingErrorValidation;

type DictionaryProcessingErrorSuccess = {
	status: 'SUCCESS';
	data: Record<string, DataRecord[]>;
};
type DictionaryProcessingErrorParsing = {
	status: 'ERROR_PARSING';
	data: ParseDictionaryData;
};

/**
 * Includes all converted data plus the list of errors that occurred in validation.
 */
type DictionaryProcessingErrorValidation = {
	status: 'ERROR_VALIDATION';
	data: Record<string, DataRecord[]>;
	errors: DictionaryValidationError[];
};
export type DictionaryProcessingResult =
	| DictionaryProcessingErrorSuccess
	| DictionaryProcessingErrorParsing
	| DictionaryProcessingErrorValidation;

export interface FieldNamesByPriorityMap {
	required: string[];
	optional: string[];
}
